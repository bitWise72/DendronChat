import { FastifyInstance } from "fastify"
import { getSupabaseForProject } from "../store.js"
import { introspectPostgres } from "../tools/introspect.js"
import { encrypt } from "../auth/encryption.js" // reuse encryption

export async function toolRoutes(app: FastifyInstance) {
    // Configurator: Connect DB
    app.post("/tools/connect-db", async (req, res) => {
        const { projectId, dbType, uri } = req.body as any
        // Validate uri format for pg?

        try {
            const supabase = await getSupabaseForProject(app, projectId)

            // Test connection
            // We'll introspect just to check if it works
            if (dbType === 'postgres') {
                await introspectPostgres(uri)
            }

            const encryptedUri = encrypt(uri)

            const { error } = await supabase
                .from("dendron_db_connections")
                .upsert({
                    project_id: projectId,
                    db_type: dbType,
                    encrypted_uri: encryptedUri
                })

            if (error) throw error
            return { status: "connected" }
        } catch (err: any) {
            app.log.error(err)
            res.code(400).send({ error: "connection_failed", details: err.message })
        }
    })

    // Configurator: Introspect
    app.post("/tools/introspect", async (req, res) => {
        const { projectId, uri } = req.body as any
        // If URI provided directly (testing) use it, else fetch from DB if projectId given?
        // Prompt says: "Enter DB URI -> Click Introspect". Usually means client sends URI. I'll support both if possible or just URI.
        // The snippet used `const { uri } = req.body`. I'll follow that.

        try {
            const columns = await introspectPostgres(uri)
            return { columns }
        } catch (err: any) {
            app.log.error(err)
            res.code(500).send({ error: "introspection_failed", details: err.message })
        }
    })

    // Configurator: Save Allowlist
    app.post("/tools/allowlist", async (req, res) => {
        const { projectId, table, columns } = req.body as any

        try {
            const supabase = await getSupabaseForProject(app, projectId) // Use store to get authed client
            // Actually, for saving allowlist, we need to write to `dendron_db_allowlist`

            const records = columns.map((c: string) => ({
                project_id: projectId,
                table_name: table,
                column_name: c
            }))

            // We delete existing for this table first? Or upsert?
            // Prompt says "insert". Let's try upsert or delete-insert.
            // Simplest: delete for this table/project, then insert.

            await supabase.from("dendron_db_allowlist").delete().match({ project_id: projectId, table_name: table })

            const { error } = await supabase.from("dendron_db_allowlist").insert(records)

            if (error) throw error
            return { status: "saved" }

        } catch (err: any) {
            app.log.error(err)
            res.code(500).send({ error: "save_failed", details: err.message })
        }
    })
}
