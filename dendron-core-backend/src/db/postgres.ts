import { Client } from "pg"

export async function pgClient(uri: string) {
    // In production, we'd use a pool, but for this Milestone client-per-request is acceptable or single client if managing state.
    // The provided snippet uses Client per call.
    const client = new Client({ connectionString: uri })
    await client.connect()
    return client
}
