import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!
const supabase = createClient(supabaseUrl, supabaseKey)

const provider = Deno.env.get("LLM_PROVIDER") || "openai"

async function getEmbedding(text: string): Promise<number[]> {
    const model = Deno.env.get("EMBEDDING_MODEL") || "text-embedding-3-small"

    if (provider === "openai") {
        const res = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ model, input: text })
        })
        const json = await res.json()
        return json.data[0].embedding
    } else if (provider === "gemini") {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: `models/${model}`,
                    content: { parts: [{ text }] }
                })
            }
        )
        const json = await res.json()
        return json.embedding.values
    }
    throw new Error("Unsupported provider for embeddings")
}

async function getChatCompletion(messages: { role: string; content: string }[]): Promise<string> {
    const model = Deno.env.get("CHAT_MODEL") || "gpt-4o-mini"

    if (provider === "openai") {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ model, messages })
        })
        const json = await res.json()
        return json.choices[0].message.content
    } else if (provider === "gemini") {
        const contents = messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
        }))
        const systemInstruction = messages.find((m) => m.role === "system")?.content
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: contents.filter((c) => c.role !== "system"),
                    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
                })
            }
        )
        const json = await res.json()
        return json.candidates[0].content.parts[0].text
    } else if (provider === "anthropic") {
        const systemPrompt = messages.find((m) => m.role === "system")?.content || ""
        const anthropicMessages = messages.filter((m) => m.role !== "system")
        const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model,
                max_tokens: 1024,
                system: systemPrompt,
                messages: anthropicMessages
            })
        })
        const json = await res.json()
        return json.content[0].text
    }
    throw new Error("Unsupported provider")
}

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 })
    }

    const { projectId, message } = await req.json()

    const { data: config } = await supabase
        .from("dendron_assistant_config")
        .select("*")
        .eq("project_id", projectId)
        .single()

    if (!config) {
        return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 })
    }

    let context = ""
    try {
        const queryEmbedding = await getEmbedding(message)
        const { data: matches } = await supabase.rpc("match_chunks", {
            query_embedding: queryEmbedding,
            match_count: 4,
            pid: projectId
        })
        context = (matches || []).map((m: { content: string }) => m.content).join("\n\n")
    } catch {
        // RAG optional, continue without context
    }

    const messages = [
        { role: "system", content: config.system_prompt },
        ...(context ? [{ role: "system", content: `Context:\n${context}` }] : []),
        { role: "user", content: message }
    ]

    const answer = await getChatCompletion(messages)

    return new Response(JSON.stringify({ answer }), {
        headers: { "Content-Type": "application/json" }
    })
})
