import { FastifyInstance } from "fastify"
import { getSupabaseForProject } from "../store.js"
import { scrapeUrl } from "../rag/scrape.js"
import { chunkText } from "../rag/chunk.js"
import { generateEmbedding } from "../rag/embed.js"

export async function ingestRoute(app: FastifyInstance) {
    app.post("/rag/ingest", async (req, res) => {
        const { projectId, url, openAiKey } = req.body as any

        if (!projectId || !url || !openAiKey) {
            res.code(400).send({ error: "missing_params" })
            return
        }

        try {
            const supabase = await getSupabaseForProject(app, projectId)

            // 1. Scrape
            const text = await scrapeUrl(url)
            if (!text || text.length < 50) {
                return { status: "failed", reason: "insufficient_content" }
            }

            // 2. Chunk
            const chunks = chunkText(text)

            // 3. Store Document
            const { data: doc, error: docError } = await supabase
                .from("dendron_documents")
                .insert({
                    project_id: projectId,
                    source_url: url
                })
                .select()
                .single()

            if (docError || !doc) {
                throw new Error(`Failed to create document record: ${docError?.message}`)
            }

            // 4. Embed & Store Chunks
            // Process in batches to avoid rate limits
            const vectors = []
            for (const chunk of chunks) {
                const embedding = await generateEmbedding(chunk, openAiKey)
                vectors.push({
                    document_id: doc.id,
                    content: chunk,
                    embedding
                })
            }

            const { error: chunkError } = await supabase
                .from("dendron_chunks")
                .insert(vectors)

            if (chunkError) {
                throw new Error(`Failed to store chunks: ${chunkError.message}`)
            }

            return { status: "success", chunks: chunks.length }

        } catch (err: any) {
            app.log.error(err)
            res.code(500).send({ error: err.message })
        }
    })
}
