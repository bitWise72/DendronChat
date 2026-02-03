import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { MongoClient } from "mongodb"
import { Client } from "pg"
import OpenAI from "openai"

// This would strictly run in a Node.js environment on Vercel
export const maxDuration = 300 // 5 minutes max for ingestion

export async function POST(req: Request) {
    try {
        const { dbConfig, llmConfig, projectRef, anonKey } = await req.json()

        if (!dbConfig || !projectRef || !anonKey) {
            return NextResponse.json({ error: "Missing config" }, { status: 400 })
        }

        // 1. Initialize Clients
        const supabase = createClient(`https://${projectRef}.supabase.co`, anonKey)
        const openai = new OpenAI({ apiKey: llmConfig?.apiKey || process.env.OPENAI_API_KEY })

        let rows: any[] = []

        // 2. Fetch Data
        if (dbConfig.type === "postgres") {
            const client = new Client({ connectionString: dbConfig.connectionString })
            await client.connect()
            try {
                // Determine which tables to read
                const tables = Object.keys(dbConfig.selectedSchema || {}).filter(t => dbConfig.selectedSchema[t].selected)

                for (const table of tables) {
                    const columns = Object.keys(dbConfig.selectedSchema[table].columns)
                        .filter(c => dbConfig.selectedSchema[table].columns[c])

                    if (columns.length === 0) continue

                    // Safe query construction (basic)
                    const res = await client.query(`SELECT ${columns.join(", ")} FROM "${table}" LIMIT 100`) // Limit for demo
                    rows.push(...res.rows.map(r => ({ content: JSON.stringify(r), src: table })))
                }
            } finally {
                await client.end()
            }
        } else if (dbConfig.type === "mongodb") {
            const client = new MongoClient(dbConfig.connectionString)
            await client.connect()
            try {
                const db = client.db()
                const collections = Object.keys(dbConfig.selectedSchema || {}).filter(c => dbConfig.selectedSchema[c].selected)

                for (const colName of collections) {
                    // Mongo projection
                    const projection: any = {}
                    // Mongo logic might need refining based on deep object structures, keeping simple for now
                    const docs = await db.collection(colName).find({}).limit(50).toArray()
                    rows.push(...docs.map(d => ({ content: JSON.stringify(d), src: colName })))
                }
            } finally {
                await client.close()
            }
        }

        // 3. Generate Embeddings & Upsert
        console.log(`Ingesting ${rows.length} rows...`)
        let processed = 0

        for (const row of rows) {
            try {
                if (!row.content || row.content.length < 5) continue

                const embeddingResponse = await openai.embeddings.create({
                    model: "text-embedding-3-small",
                    input: row.content,
                })
                const embedding = embeddingResponse.data[0].embedding

                // Insert into Supabase
                const { error } = await supabase.from("dendron_chunks").insert({
                    project_id: "default", // or specific ID
                    content: row.content,
                    metadata: { source: row.src },
                    embedding
                })

                if (error) console.error("Supabase Insert Error:", error)
                else processed++
            } catch (err) {
                console.error("Embedding Error:", err)
            }
        }

        return NextResponse.json({ success: true, processed, total: rows.length })

    } catch (e: any) {
        console.error("Ingest Error:", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
