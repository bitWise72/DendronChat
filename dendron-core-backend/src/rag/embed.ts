import fetch from "node-fetch"

export async function generateEmbedding(text: string, apiKey: string) {
    // Default to OpenAI for "provider-agnostic" interface (most common standard)
    // In a real generic system, we'd pass provider type. For this Milestone, assuming OpenAI compatibility.
    // User mentioned "Use user-provided LLM embedding API key".

    const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "text-embedding-3-small", // Standard efficient model
            input: text
        })
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`Embedding API Error: ${err}`)
    }

    const data = await response.json() as any
    return data.data[0].embedding as number[]
}
