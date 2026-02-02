import { FastifyInstance } from "fastify"
import { createClient } from "@supabase/supabase-js"
import { decrypt } from "./auth/encryption.js"

// Generic error for missing credentials
export class ProjectNotConfiguredError extends Error {
    constructor(projectId: string) {
        super(`Project ${projectId} not configured with Supabase`)
        this.name = "ProjectNotConfiguredError"
    }
}

export async function getSupabaseForProject(app: FastifyInstance, projectId: string) {
    if (!app.mongo || !app.mongo.db) {
        throw new Error("Database connection not available")
    }

    const creds = await app.mongo.db.collection("supabase_creds").findOne({ projectId })

    if (!creds || !creds.supabaseUrl || !creds.encryptedServiceRole) {
        throw new ProjectNotConfiguredError(projectId)
    }

    const serviceRoleKey = decrypt(creds.encryptedServiceRole)

    return createClient(creds.supabaseUrl, serviceRoleKey)
}
