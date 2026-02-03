import { NextResponse } from "next/server"

// Payloads for injection
const SQL_SCHEMA = `
create extension if not exists vector;
create table if not exists dendron_assistant_config (
  id text primary key,
  config jsonb not null,
  created_at timestamp with time zone default now()
);
create table if not exists dendron_chunks (
  id bigserial primary key,
  project_id text not null,
  content text not null,
  metadata jsonb,
  embedding vector(1536)
);
create index on dendron_chunks using ivfflat (embedding vector_cosine_ops);
`

const CHAT_FUNCTION_CODE = `
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
serve(async (req) => {
  return new Response(JSON.stringify({ answer: "Dendron is active!" }), { headers: { "Content-Type": "application/json" } })
})
`

export async function POST(request: Request) {
    try {
        const { code, config } = await request.json()

        // 1. Exchange Code for Token
        const tokenRes = await fetch("https://api.supabase.com/v1/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                client_id: process.env.SUPABASE_OAUTH_CLIENT_ID!,
                client_secret: process.env.SUPABASE_OAUTH_CLIENT_SECRET!,
                redirect_uri: process.env.SUPABASE_OAUTH_REDIRECT_URI!,
            }),
        })
        const tokens = await tokenRes.json()
        if (!tokenRes.ok) throw new Error("Failed to exchange token: " + (tokens.error_description || tokens.error))

        const accessToken = tokens.access_token

        // 2. Get Organization
        const orgsRes = await fetch("https://api.supabase.com/v1/organizations", {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
        const orgs = await orgsRes.json()
        const org = orgs[0]
        if (!org) throw new Error("No organizations found in your Supabase account.")

        // 3. Create Project (In production, you'd check if it exists or create new)
        // Note: Creating a project can take minutes. For this installer, we will ATTEMPT to create one
        // or the user might have selected one. Here we "Create" for the demo.
        /*
        const projectRes = await fetch("https://api.supabase.com/v1/projects", {
          method: "POST",
          headers: { 
            Authorization: \`Bearer \${accessToken}\`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: config.projectId,
            organization_id: org.id,
            region: "us-east-1",
            plan: "free"
          })
        })
        const project = await projectRes.json()
        */

        // MOCK RESPONSE for the sake of the guide unless fully production ready
        // In a real app, you would poll for project readiness
        const projectRef = "mock-ref-" + Math.random().toString(36).slice(2, 8)

        // 4. Execute SQL (Simplified for demo)
        // In a real tool, you'd use the Management API's /database/query endpoint

        // 5. Deploy Functions
        // Deploying functions via Management API requires gzipping the code and uploading

        return NextResponse.json({
            projectRef: projectRef,
            supabaseUrl: `https://${projectRef}.supabase.co`,
            anonKey: "mock-anon-key-provided-after-provisioning"
        })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
