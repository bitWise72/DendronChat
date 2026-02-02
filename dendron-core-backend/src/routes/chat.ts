import { FastifyInstance } from "fastify"
import { getSupabaseForProject } from "../store.js"
import { retrieveContext } from "../rag/retrieve.js"
import { buildSystemPrompt } from "../rag/prompt.js"
import { executeSelect } from "../tools/execute.js"
import { decrypt } from "../auth/encryption.js"
import fetch from "node-fetch"

export async function chatRoutes(app: FastifyInstance) {
    app.post("/chat", async (req, res) => {
        const body = req.body as any
        const { projectId, text, openAiKey } = body

        if (!openAiKey) {
            res.code(400).send({ error: "api_key_required_for_full_features" })
            return
        }

        try {
            const supabase = await getSupabaseForProject(app, projectId)

            // 1. RAG Retrieval
            let contextChunks: string[] = []
            try {
                contextChunks = await retrieveContext(supabase, text, projectId, openAiKey)
            } catch (retrieveError) {
                app.log.warn(`Retrieval failed: ${retrieveError}`)
            }

            // 2. Build Prompt
            const { data: config } = await supabase
                .from("dendron_assistant_config")
                .select("system_prompt")
                .eq("project_id", projectId)
                .single()

            const systemPrompt = buildSystemPrompt(config?.system_prompt || "You are a helpful assistant.", contextChunks)

            // 3. Prepare Tools (DB)
            const { data: connection } = await supabase
                .from("dendron_db_connections")
                .select("*")
                .eq("project_id", projectId)
                .single()

            // Fetch allowlist
            const { data: allowedCols } = await supabase
                .from("dendron_db_allowlist")
                .select("*")
                .eq("project_id", projectId)

            let tools: any[] = []
            let dbUri = ""
            let allowlistMap: Record<string, string[]> = {}

            if (connection && allowedCols && allowedCols.length > 0) {
                dbUri = decrypt(connection.encrypted_uri)

                // Group by table
                allowedCols.forEach((row: any) => {
                    if (!allowlistMap[row.table_name]) {
                        allowlistMap[row.table_name] = []
                    }
                    allowlistMap[row.table_name].push(row.column_name)
                })

                // Define tool
                tools.push({
                    type: "function",
                    function: {
                        name: "select_from_table",
                        description: "Select data from the user's database. Use this when the answer might be in the database tables.",
                        parameters: {
                            type: "object",
                            properties: {
                                table: {
                                    type: "string",
                                    enum: Object.keys(allowlistMap),
                                    description: "The table to query"
                                },
                                where: {
                                    type: "object",
                                    description: "Key-value pairs for filtering (equality checks only). E.g. { id: 5, status: 'active' }"
                                }
                            },
                            required: ["table"]
                        }
                    }
                })
            }

            // 4. Call LLM
            const params: any = {
                model: "gpt-4o-mini", // Using model from user's snippet, fallback to gpt-3.5 if needed, but tool use works best on newer models
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ]
            }

            if (tools.length > 0) {
                params.tools = tools
            }

            const llmRes = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openAiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(params)
            })

            if (!llmRes.ok) throw new Error(`LLM Error: ${await llmRes.text()}`)
            const json = await llmRes.json() as any
            const msg = json.choices[0].message
            const toolCalls = msg.tool_calls

            if (toolCalls && toolCalls.length > 0) {
                const toolCall = toolCalls[0] // handle first for simplicity in Phase-1
                if (toolCall.function.name === "select_from_table") {
                    const args = JSON.parse(toolCall.function.arguments)
                    const { table, where } = args

                    // Security Check: is table in allowlist?
                    if (!allowlistMap[table]) {
                        return { answer: "Error: Table not allowed." }
                    }

                    // Execute
                    const columns = allowlistMap[table]
                    let result = []
                    try {
                        result = await executeSelect(dbUri, table, columns, where || {})
                    } catch (dbErr) {
                        return { answer: `Database Error: ${dbErr}` }
                    }

                    // Feed back implementation: typically we send result back to LLM.
                    // For "Phase-1 completion", request says "Result returned as answer".
                    // I'll return the raw result as user snippet did: "return { answer: result }"
                    // Or I can format it a bit nicer JSON string.

                    return { answer: JSON.stringify(result, null, 2) }
                }
            }

            return { answer: msg.content }

        } catch (err: any) {
            if (err.name === "ProjectNotConfiguredError") {
                res.code(404).send({ error: "project_not_configured" })
                return
            }
            app.log.error(err)
            res.code(500).send({ error: "internal_server_error", details: err.message })
        }
    })
}
