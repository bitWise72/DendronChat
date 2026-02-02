import { SupabaseClient } from "@supabase/supabase-js"
import { generateEmbedding } from "./embed.js"

export async function retrieveContext(
    supabase: SupabaseClient,
    query: string,
    projectId: string,
    apiKey: string,
    limit = 5
) {
    const embedding = await generateEmbedding(query, apiKey)

    const { data: chunks, error } = await supabase.rpc("match_documents", {
        query_embedding: embedding,
        match_threshold: 0.7, // Reasonable default
        match_count: limit,
        filter_project_id: projectId
    })

    if (error) {
        console.error("Vector search error:", error)
        return []
    }

    return chunks?.map((c: any) => c.content) || []
}
