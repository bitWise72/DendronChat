import { pgClient } from "../db/postgres.js"

export async function executeSelect(
    uri: string,
    table: string,
    columns: string[],
    where: Record<string, any>
) {
    const client = await pgClient(uri)
    try {
        // Validate columns to avoid injection (simple allowlist check usually happens before calling this, but double check is good)
        // For this function, we assume `columns` are safe identifiers from the caller (which checks allowlist)
        // Only `table` and `columns` are interpolated as identifiers. `where` values are parameterized.

        const safeColumns = columns.map(c => `"${c.replace(/"/g, '""')}"`).join(",") // Basic quote escaping
        const safeTable = `"${table.replace(/"/g, '""')}"`

        let sql = `select ${safeColumns} from ${safeTable}`
        const values: any[] = []

        if (where && Object.keys(where).length > 0) {
            const keys = Object.keys(where)
            const clauses = keys.map((k, i) => `"${k.replace(/"/g, '""')}" = $${i + 1}`).join(" and ")
            sql += ` where ${clauses}`
            values.push(...Object.values(where))
        }

        console.log(`Executing Safe SQL: ${sql} with values ${JSON.stringify(values)}`)
        const res = await client.query(sql, values)
        return res.rows
    } finally {
        await client.end()
    }
}
