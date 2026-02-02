import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!
const supabase = createClient(supabaseUrl, supabaseKey)

const provider = Deno.env.get("LLM_PROVIDER") || "openai"

function chunkText(text: string, size = 500, overlap = 50) {
    const words = text.split(/\s+/)
    const chunks = []
    let i = 0
    while (i < words.length) {
        chunks.push(words.slice(i, i + size).join(" "))
        i += size - overlap
    }
    return chunks
}

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
    throw new Error("Unsupported provider for embeddings. Anthropic does not support embeddings natively.")
}

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 })
    }

    const { projectId, url } = await req.json()

    const html = await fetch(url).then((r) => r.text())
    const doc = new DOMParser().parseFromString(html, "text/html")
    if (!doc) {
        return new Response(JSON.stringify({ error: "Failed to parse HTML" }), { status: 400 })
    }

    const text = doc.body.textContent.replace(/\s+/g, " ").trim()
    const chunks = chunkText(text)

    let ingested = 0
    for (const chunk of chunks) {
        try {
            const embedding = await getEmbedding(chunk)
            await supabase.from("dendron_chunks").insert({
                project_id: projectId,
                content: chunk,
                embedding
            })
            ingested++
        } catch (e) {
            console.error("Chunk embedding failed:", e)
        }
    }

    return new Response(
        JSON.stringify({ status: "ingested", chunks: ingested }),
        { headers: { "Content-Type": "application/json" } }
    )
})
