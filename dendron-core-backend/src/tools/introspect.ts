import { pgClient } from "../db/postgres.js"

export async function introspectPostgres(uri: string) {
    const client = await pgClient(uri)
    try {
        const res = await client.query(`
        select table_name, column_name
        from information_schema.columns
        where table_schema = 'public'
        order by table_name, ordinal_position
      `)
        return res.rows
    } finally {
        await client.end()
    }
}
