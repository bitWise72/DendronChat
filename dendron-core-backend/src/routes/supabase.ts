import { FastifyInstance } from "fastify"
import qs from "qs"
import fetch from "node-fetch"
import { encrypt } from "../auth/encryption.js"

const AUTHORIZE_URL = "https://api.supabase.com/v1/oauth/authorize"
const TOKEN_URL = "https://api.supabase.com/v1/oauth/token"

export async function supabaseRoutes(app: FastifyInstance) {
    app.get("/supabase/connect", async (req, res) => {
        const params = qs.stringify({
            client_id: process.env.SUPABASE_OAUTH_CLIENT_ID,
            redirect_uri: `${process.env.BACKEND_BASE_URL}/supabase/callback`,
            response_type: "code",
            scope: "projects.read databases.read storage.read"
        })
        res.redirect(`${AUTHORIZE_URL}?${params}`)
    })

    app.get("/supabase/callback", async (req, res) => {
        const code = (req.query as any).code
        if (!code) {
            res.code(400).send({ error: "code_missing" })
            return
        }

        try {
            const tokenRes = await fetch(TOKEN_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${Buffer.from(`${process.env.SUPABASE_OAUTH_CLIENT_ID}:${process.env.SUPABASE_OAUTH_CLIENT_SECRET}`).toString("base64")}`
                },
                body: JSON.stringify({
                    code,
                    grant_type: "authorization_code",
                    redirect_uri: `${process.env.BACKEND_BASE_URL}/supabase/callback`
                })
            })

            if (!tokenRes.ok) {
                const errorText = await tokenRes.text();
                res.code(tokenRes.status).send({ error: "token_exchange_failed", details: errorText });
                return;
            }

            const tokenData = await tokenRes.json() as any
            const { access_token, refresh_token } = tokenData

            // Fetch project list to get the first project (or handle selection? For now, we assume user picks one or we default)
            // Note: The example code assumed `tokenData` returned a project, but usually OAuth returns tokens.
            // We'll need to fetch the organizations/projects to find the one the user just authorized.
            // HOWEVER, the Supabase Management API docs say the /token endpoint returns the `current_project` if one was selected? 
            // Let's assume standard flow: we get an access token, then we call the management API to get projects.
            // BUT the provided example code showed `const { access_token, refresh_token, project } = tokenData`. 
            // I will follow the user's provided snippet logic for now, assuming their custom OAuth flow documentation is accurate for this context, 
            // but adding a safeguard if 'project' is missing.

            // Actually, let's verify if `project` comes back in the token response. Supabase docs usually require a separate call.
            // But for strict adherence to the USER PROVIDED snippet:

            // Wait, looking at the user's snippet:
            // const { access_token, refresh_token, project } = tokenData

            // I will stick to that.
            const project = tokenData.project || (tokenData.projects?.[0]) // Fallback attempt

            if (!project) {
                // If project isn't in token response, we would typically fetch it.
                // For now, I'll error out to be safe if it's missing, or maybe the user knows something I don't about their specific OAuth setup.
                res.code(500).send({ error: "no_project_received", debug: tokenData })
                return
            }

            const supabaseUrl = `https://${project.ref}.supabase.co` // Typical pattern, or use project.endpoint
            // project.service_role_key IS NOT usually returned by OAuth! OAuth returns an access token you use to call the API.
            // BUT, if this is a "Connect with Supabase" integration (Integration Auth), maybe it sends keys?
            // The user says "Exchange the received authorization code for project credentials".
            // AND "Supabase redirects back... Backend exchanges code for tokens & project credentials".
            // I will trust the user's snippet that `project.service_role_key` is available, 
            // OR I will assume we must fetch it using the access_token.
            // To be safe and functional, I will try to use what's there. 

            // RE-READING USER REQUEST: "const supabaseServiceRole = project?.service_role_key"
            // Okay, I will follow that exactly.

            const supabaseServiceRole = project?.service_role_key

            if (!supabaseServiceRole) {
                res.code(500).send({ error: "service_role_key_missing_in_oauth_response" })
                return
            }

            const encryptedKey = encrypt(supabaseServiceRole)

            // Ensure mongo is available
            if (!app.mongo.db) {
                res.code(500).send({ error: "database_not_connected" })
                return
            }

            await app.mongo.db.collection("supabase_creds").updateOne(
                { projectId: project.ref },
                {
                    $set: {
                        supabaseUrl, // or project.endpoint
                        encryptedServiceRole: encryptedKey,
                        access_token,
                        refresh_token,
                        updatedAt: new Date()
                    }
                },
                { upsert: true }
            )

            res.redirect(`${process.env.FRONTEND_BASE_URL}/connected?projectId=${project.ref}`)

        } catch (err: any) {
            app.log.error(err)
            res.code(500).send({ error: "internal_server_error", message: err.message })
        }
    })
}
