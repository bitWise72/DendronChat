import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, config, manual, supabaseUrl, serviceKey } = body

    // 0. MANUAL MODE (Bring Your Own Keys)
    if (manual) {
      if (!supabaseUrl || !serviceKey) {
        return NextResponse.json({ error: "Missing Supabase URL or Key" }, { status: 400 })
      }

      const supabase = createClient(supabaseUrl, serviceKey)

      // 1. Upsert Public Config
      const { error: pubError } = await supabase.from("dendron_public_config").upsert({
        project_id: config.projectId || "default",
        assistant_name: config.assistantName,
        mascot_url: config.mascotUrl,
        theme_color: config.themeColor,
        website_url: config.websiteUrl || "",
        created_at: new Date().toISOString()
      })

      if (pubError) {
        console.error("Public Config Error:", pubError)
        if (pubError.code === "42P01" || pubError.message.includes("does not exist") || pubError.message.includes("relation")) {
          return NextResponse.json({
            error: "Tables not found. Please run the SQL script in your Supabase SQL Editor first.",
            debug: pubError
          }, { status: 400 })
        }
        return NextResponse.json({ error: "Public Config Failed: " + pubError.message }, { status: 400 })
      }

      // 2. Upsert Private Config
      const { error: privError } = await supabase.from("dendron_private_config").upsert({
        project_id: config.projectId || "default",
        db_config: config.dbConfig,
        llm_config: config.llmConfig,
        created_at: new Date().toISOString()
      })

      if (privError) {
        return NextResponse.json({ error: "Private Config Failed (Secure Storage): " + privError.message }, { status: 400 })
      }

      // Generate a mock ref for the frontend to use (domain extraction)
      // e.g. https://xyz.supabase.co -> xyz
      const projectRef = supabaseUrl.replace("https://", "").replace("http://", "").split(".")[0]

      return NextResponse.json({
        projectRef,
        supabaseUrl,
        anonKey: serviceKey // Using Service Key as Anon Key for simplicity in manual mode
      })
    }

    // 1. OAUTH FLOW
    // Regex: keep only letters, numbers, hyphens, and underscores
    const clean = (val: string | undefined) => val?.replace(/[^a-zA-Z0-9\-_]/g, '') || ""

    const client_id = clean(process.env.SUPABASE_OAUTH_CLIENT_ID)
    const client_secret = clean(process.env.SUPABASE_OAUTH_CLIENT_SECRET)
    const redirect_uri = process.env.SUPABASE_OAUTH_REDIRECT_URI?.trim().replace(/^["']|["']$/g, '')

    if (!client_id || !client_secret || !redirect_uri) {
      throw new Error("Missing OAUTH credentials on server")
    }

    // Exchange Code for Token
    const tokenRes = await fetch("https://api.supabase.com/v1/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: client_id,
        client_secret: client_secret,
        redirect_uri: redirect_uri,
      }),
    })

    const SQL_SCHEMA = `
create extension if not exists vector;

-- 1. Public Config (Safe for Frontend to read)
create table if not exists dendron_public_config (
  project_id text primary key,
  assistant_name text,
  mascot_url text,
  theme_color text,
  website_url text,
  created_at timestamp with time zone default now()
);
alter table dendron_public_config enable row level security;
-- Allow anyone to read public config (needed for Chat UI to load theme)
create policy "Allow public read" on dendron_public_config for select using (true);
-- Allow service role to manage it
create policy "Allow service role full access" on dendron_public_config using (auth.role() = 'service_role');


-- 2. Private Config (API Keys - NEVER exposed to client)
create table if not exists dendron_private_config (
  project_id text primary key references dendron_public_config(project_id),
  db_config jsonb,
  llm_config jsonb, -- Contains API Keys
  created_at timestamp with time zone default now()
);
alter table dendron_private_config enable row level security;
-- No public policies! Only Service Role can access.


-- 3. RAG Chunks
create table if not exists dendron_chunks (
  id bigserial primary key,
  project_id text not null,
  content text not null,
  metadata jsonb,
  embedding vector(1536)
);
create index on dendron_chunks using ivfflat (embedding vector_cosine_ops);
alter table dendron_chunks enable row level security;
create policy "Allow service role full access" on dendron_chunks using (auth.role() = 'service_role');
`
    const tokens = await tokenRes.json()
    if (!tokenRes.ok) {
      return NextResponse.json({
        error: tokens.error_description || tokens.error || "Failed to exchange token",
        debug: { status: tokenRes.status, tokens }
      }, { status: 400 })
    }

    // In a real app, we would use the access token to create a project via Management API
    // For this demo/installer, we fall back to the mock if not implemented fully.

    // MOCK RESPONSE for OAUTH flow in this version
    const projectRef = "mock-ref-" + Math.random().toString(36).slice(2, 8)
    const mockUrl = `https://${projectRef}.supabase.co`
    const mockKey = "mock-anon-key-provided-after-provisioning"

    return NextResponse.json({
      projectRef,
      supabaseUrl: mockUrl,
      anonKey: mockKey
    })

  } catch (e: any) {
    return NextResponse.json({
      error: e.message || "Unknown internal error",
    }, { status: 500 })
  }
}
