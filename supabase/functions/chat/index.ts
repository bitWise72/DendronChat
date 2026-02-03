import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // 1. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // 2. Handle Config Fetch (GET)
    if (req.method === 'GET') {
        const url = new URL(req.url)
        const pid = url.searchParams.get("project_id")
        if (!pid) return new Response(JSON.stringify({ error: "Missing project_id" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!
        const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")! // Anon can read public config due to RLS
        const supabase = createClient(supabaseUrl, supabaseKey)

        const { data, error } = await supabase.from("dendron_public_config").select("*").eq("project_id", pid).single()
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    try {
        const { projectId, message } = await req.json()

        if (!projectId || !message) {
            return new Response(JSON.stringify({ error: "Missing projectId or message" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // 2. Initialize Supabase Admin (to fetch secured config)
        // Note: In production, use Service Role Key for secure access to secrets
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 3. Fetch Project Config
        // Fetch public config (contains assistant name, etc)
        const { data: pubConfig, error: pubError } = await supabase
            .from("dendron_public_config")
            .select("*")
            .eq("project_id", projectId)
            .single()

        if (pubError || !pubConfig) {
            console.error("Public Config Error:", pubError)
            return new Response(JSON.stringify({ error: "Configuration not found for this project." }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // Fetch private config (contains API keys)
        const { data: privConfig, error: privError } = await supabase
            .from("dendron_private_config")
            .select("*")
            .eq("project_id", projectId)
            .single()

        if (privError || !privConfig) {
            console.error("Private Config Error:", privError)
            return new Response(JSON.stringify({ error: "Detailed configuration missing (Private Config)." }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const { llm_config } = privConfig
        const assistant_name = pubConfig.assistant_name
        const provider = llm_config?.provider || "openai"
        const apiKey = llm_config?.apiKey
        const modelName = llm_config?.chatModel || "gpt-4o-mini"

        if (!apiKey) {
            return new Response(JSON.stringify({ error: "LLM API Key not configured." }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // 4. RAG Retrieval (Optional)
        let context = ""
        try {
            // Retrieve chunks based on similarity
            // Note: We need to use the SAME embedding model as ingestion. 
            // For simplicity, we assume text-embedding-3-small (OpenAI) for now if openai is provider.
            // If the user uses a different provider, we'd need that provider's embedding logic here too.
            // Keeping it simple: If OpenAI, do RAG.
            if (provider === "openai") {
                const embRes = await fetch("https://api.openai.com/v1/embeddings", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ model: "text-embedding-3-small", input: message })
                })
                const embJson = await embRes.json()
                const embedding = embJson.data?.[0]?.embedding

                if (embedding) {
                    const { data: matches } = await supabase.rpc("match_chunks", {
                        query_embedding: embedding,
                        match_count: 5,
                        pid: projectId
                    })
                    context = (matches || []).map((m: any) => m.content).join("\n\n")
                }
            }
        } catch (e) {
            console.warn("RAG Error:", e)
        }

        // 5. Chat Completion
        const systemPrompt = `You are ${config.assistant_name || "a helpful assistant"}. \n\nContext from knowledge base:\n${context}`
        let answer = ""

        if (provider === "openai") {
            const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: modelName,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: message }
                    ]
                })
            })
            const chatJson = await chatRes.json()
            answer = chatJson.choices?.[0]?.message?.content || "Error from OpenAI"
        }
        else if (provider === "anthropic") {
            const chatRes = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: modelName || "claude-3-5-sonnet-20240620",
                    max_tokens: 1024,
                    system: systemPrompt,
                    messages: [{ role: "user", content: message }]
                })
            })
            const chatJson = await chatRes.json()
            answer = chatJson.content?.[0]?.text || "Error from Anthropic"
        }
        else if (provider === "gemini") {
            const chatRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + message }] }]
                })
            })
            const chatJson = await chatRes.json()
            answer = chatJson.candidates?.[0]?.content?.parts?.[0]?.text || "Error from Gemini"
        }

        return new Response(JSON.stringify({ answer }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
})
