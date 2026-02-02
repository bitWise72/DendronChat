import { FastifyInstance } from "fastify"
import { getSupabaseForProject } from "../store.js"

export async function projectRoutes(app: FastifyInstance) {
    app.get("/project/:id/config", async (req, res) => {
        const { id } = req.params as any

        try {
            const supabase = await getSupabaseForProject(app, id)

            const { data, error } = await supabase
                .from("dendron_assistant_config")
                .select("*")
                .eq("project_id", id)
                .single()

            if (error || !data) {
                res.code(404)
                return { error: "project_not_found_or_config_missing" }
            }

            return {
                name: id,
                iconUrl: data.mascot_url,
                systemPrompt: data.system_prompt,
                welcomeMessage: data.welcome_message,
                theme: data.theme,
                chatEndpoint: "/chat"
            }
        } catch (err: any) {
            if (err.name === "ProjectNotConfiguredError") {
                res.code(404).send({ error: "project_not_configured" })
                return
            }
            app.log.error(err)
            res.code(500).send({ error: "internal_server_error" })
        }
    })
}
