import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import JSZip from "jszip"
// import { OpenAIEmbeddings } from "@langchain/openai"
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

// --- CONSTANTS ---
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
create policy "Allow public read" on dendron_public_config for select using (true);
create policy "Allow service role full access" on dendron_public_config using (auth.role() = 'service_role');

-- 2. Private Config (API Keys - NEVER exposed to client)
create table if not exists dendron_private_config (
  project_id text primary key references dendron_public_config(project_id),
  db_config jsonb,
  llm_config jsonb,
  created_at timestamp with time zone default now()
);
alter table dendron_private_config enable row level security;

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

create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_project_id text
)
returns table (
  id bigint,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dendron_chunks.id,
    dendron_chunks.content,
    1 - (dendron_chunks.embedding <=> query_embedding) as similarity
  from dendron_chunks
  where 1 - (dendron_chunks.embedding <=> query_embedding) > match_threshold
  and project_id = filter_project_id
  order by dendron_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
`

// Embedding the Function Code (Normally this would be read from file)
const CHAT_FUNCTION_CODE = `
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    // Config Fetch (GET)
    if (req.method === 'GET') {
        const url = new URL(req.url)
        const pid = url.searchParams.get("project_id")
        if (!pid) return new Response(JSON.stringify({ error: "Missing project_id" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

        const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!)
        const { data, error } = await supabase.from("dendron_public_config").select("*").eq("project_id", pid).single()
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    try {
        const { projectId, message } = await req.json()
        if (!projectId || !message) return new Response(JSON.stringify({ error: "Missing projectId or message" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

        // 2. Init Admin
        const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)

        // 3. Config
        const { data: pubConfig } = await supabase.from("dendron_public_config").select("*").eq("project_id", projectId).single()
        const { data: privConfig } = await supabase.from("dendron_private_config").select("*").eq("project_id", projectId).single()

        if (!pubConfig || !privConfig) {
             return new Response(JSON.stringify({ error: "Configuration not loaded." }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const { llm_config } = privConfig
        const provider = llm_config?.provider || "openai"
        // Use injected secret first, then DB
        const apiKey = Deno.env.get("OPENAI_API_KEY") || llm_config?.apiKey
        const modelName = llm_config?.chatModel || "gpt-4o-mini"
        const systemPrompt = "You are " + (pubConfig.assistant_name || "Assistant")

         // 4. Chat
        let answer = ""
        if (provider === "openai") {
             const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: modelName,
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }]
                })
            })
            const chatJson = await chatRes.json()
            answer = chatJson.choices?.[0]?.message?.content || "Error from OpenAI"
        } else {
             answer = "Provider not fully implemented in this version."
        }

        return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
})
`

// --- HELPERS ---

async function deployFunction(accessToken: string, projectRef: string, slug: string, name: string, code: string) {
  // 1. Zip
  const zip = new JSZip()
  zip.file("index.ts", code)
  // Deno functions need an import_map.json usually, or just deps. We use direct imports for now.
  // zip.file("import_map.json", '{}') 
  const zipContent = await zip.generateAsync({ type: "blob" })

  // 2. Upload
  const formData = new FormData()
  formData.append("file", zipContent, "code.zip")
  formData.append("name", name)
  formData.append("slug", slug)
  formData.append("verify_jwt", "true")

  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/functions?slug=${slug}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      // Content-Type is set by FormData automatically
    },
    body: formData
  })

  // If it fails with 409 (Conflict), maybe we PATCH?
  // Or if fails, we check and see if we need to hit a different endpoint.
  return res
}

async function setSecrets(accessToken: string, projectRef: string, secrets: { name: string, value: string }[]) {
  return fetch(`https://api.supabase.com/v1/projects/${projectRef}/secrets`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(secrets)
  })
}


export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, config, manual, supabaseUrl, serviceKey } = body

    // 0. MANUAL MODE 
    if (manual) {
      // ... (Manual logic same as before, ensures SQL_SCHEMA is run manually by user or handled here if we had keys) ...
      // For Manual, we basically return items. But we really should ensure the Schema matches.
      // Re-using previous logic structure for brevity.
      const supabase = createClient(supabaseUrl, serviceKey)
      const { error } = await supabase.from("dendron_public_config").upsert({
        project_id: config.projectId || "default",
        assistant_name: config.assistantName,
        mascot_url: config.mascotUrl,
        theme_color: config.themeColor,
        website_url: config.websiteUrl || "",
      })
      await supabase.from("dendron_private_config").upsert({
        project_id: config.projectId || "default",
        db_config: config.dbConfig,
        llm_config: config.llmConfig
      })
      if (error) return NextResponse.json({ error: "DB Error (Manual): " + error.message }, { status: 400 })

      return NextResponse.json({
        projectRef: supabaseUrl.replace("https://", "").split(".")[0],
        supabaseUrl,
        anonKey: serviceKey,
        functionCode: CHAT_FUNCTION_CODE
      })
    }

    // 1. OAUTH FLOW
    const client_id = process.env.SUPABASE_OAUTH_CLIENT_ID
    const client_secret = process.env.SUPABASE_OAUTH_CLIENT_SECRET
    const redirect_uri = process.env.SUPABASE_OAUTH_REDIRECT_URI

    if (!client_id || !client_secret || !redirect_uri) throw new Error("Server OAUTH Config Missing")

    // Exchange Token
    const tokenRes = await fetch("https://api.supabase.com/v1/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization": `Basic ${btoa(`${client_id}:${client_secret}`)}` },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri }),
    })
    const tokens = await tokenRes.json()
    if (!tokenRes.ok) return NextResponse.json({ error: "Token Exchange Failed", debug: tokens }, { status: 400 })
    const accessToken = tokens.access_token

    // Get Project
    const projectsRes = await fetch("https://api.supabase.com/v1/projects", { headers: { "Authorization": `Bearer ${accessToken}` } })
    const projects = await projectsRes.json()
    if (!Array.isArray(projects)) {
      console.error("Supabase Projects Error:", projects)
      // If 401/403, might be token issue.
      return NextResponse.json({ error: "Failed to list Supabase projects. " + (projects.message || JSON.stringify(projects)) }, { status: 500 })
    }

    let project = projects.find((p: any) => p.name === "dendron-chat") || projects[0]
    if (!project) return NextResponse.json({ error: "No Project Found. Please create 'dendron-chat' in Supabase." }, { status: 404 })

    // Get Keys
    const keysRes = await fetch(`https://api.supabase.com/v1/projects/${project.id}/api-keys`, { headers: { "Authorization": `Bearer ${accessToken}` } })
    const keys = await keysRes.json()

    if (!Array.isArray(keys)) {
      console.error("Supabase Keys Error:", keys)
      return NextResponse.json({ error: "Failed to fetch Project Keys. " + (keys.message || JSON.stringify(keys)) }, { status: 500 })
    }

    const sbUrl = `https://${project.ref}.supabase.co`
    const sbServiceKey = keys.find((k: any) => k.name === "service_role")?.api_key
    const sbAnonKey = keys.find((k: any) => k.name === "anon")?.api_key

    // Run SQL
    const supabase = createClient(sbUrl, sbServiceKey)
    const { error: pubError } = await supabase.from("dendron_public_config").upsert({
      project_id: config.projectId || "default",
      assistant_name: config.assistantName,
      mascot_url: config.mascotUrl,
      theme_color: config.themeColor,
      website_url: config.websiteUrl || "",
    })

    if (pubError) {
      // Run Query API
      await fetch(`https://api.supabase.com/v1/projects/${project.ref}/query`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: SQL_SCHEMA })
      })
      // Retry
      await supabase.from("dendron_public_config").upsert({
        project_id: config.projectId || "default",
        assistant_name: config.assistantName,
        mascot_url: config.mascotUrl,
        theme_color: config.themeColor,
        website_url: config.websiteUrl || "",
      })
    }

    await supabase.from("dendron_private_config").upsert({
      project_id: config.projectId || "default",
      db_config: config.dbConfig,
      llm_config: config.llmConfig
    })

    // --- DEPLOYMENT ---
    // AFTER SQL & Secret Setup:
    // Trigger Ingestion if URL provided
    // if (config.websiteUrl && openAiKey) {
    // await ingestWebsite(config.websiteUrl, config.projectId, openAiKey, supabase)
    // }
    try {
      const openAiKey = config.llmConfig?.apiKey
      if (openAiKey) {
        // Note: We might need to set 'ANTHROPIC_API_KEY' or 'GOOGLE_API_KEY' too depending on provider.
        // For now, setting generic keys.
        await setSecrets(accessToken, project.ref, [
          { name: "OPENAI_API_KEY", value: openAiKey },
          { name: "ANTHROPIC_API_KEY", value: openAiKey }, // Assuming same field for demo
          { name: "GOOGLE_API_KEY", value: openAiKey }
        ])
      }
      await deployFunction(accessToken, project.ref, "chat", "chat", CHAT_FUNCTION_CODE)
    } catch (e: any) {
      console.error("Function Deployment Failed:", e)
    }

    // Ingestion Helper
    // async function ingestWebsite(url: string, projectId: string, apiKey: string, supabase: any) {
    // ... Implementation commented out for stability ...
    // }
    return NextResponse.json({
      projectRef: project.ref,
      supabaseUrl: sbUrl,
      anonKey: sbAnonKey
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
