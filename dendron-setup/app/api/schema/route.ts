import { NextResponse } from 'next/server'
import { Client } from 'pg'
import { MongoClient } from 'mongodb'

export async function POST(req: Request) {
    try {
        const { type, connectionString } = await req.json()

        if (!connectionString) {
            return NextResponse.json({ error: "Connection string is required" }, { status: 400 })
        }

        if (type === 'postgres') {
            const client = new Client({ connectionString })
            await client.connect()

            try {
                // Fetch public tables
                const tablesQuery = `
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_type = 'BASE TABLE';
                `
                const tablesRes = await client.query(tablesQuery)
                const tables = []

                for (let row of tablesRes.rows) {
                    const tableName = row.table_name
                    const colsQuery = `
                        SELECT column_name, data_type 
                        FROM information_schema.columns 
                        WHERE table_name = $1;
                    `
                    const colsRes = await client.query(colsQuery, [tableName])
                    tables.push({
                        name: tableName,
                        columns: colsRes.rows.map(c => ({ name: c.column_name, type: c.data_type }))
                    })
                }

                return NextResponse.json({ tables })
            } finally {
                await client.end()
            }
        } else if (type === 'mongodb') {
            const client = new MongoClient(connectionString)
            await client.connect()

            try {
                const db = client.db()
                const collections = await db.listCollections().toArray()
                const tables = []

                for (let col of collections) {
                    // Start simplified: Just list collections. 
                    // Getting "columns" in Mongo requires sampling documents.
                    const sample = await db.collection(col.name).findOne({})
                    const columns = sample ? Object.keys(sample).map(k => ({ name: k, type: typeof sample[k] })) : []
                    tables.push({
                        name: col.name,
                        columns
                    })
                }

                return NextResponse.json({ tables })
            } finally {
                await client.close()
            }
        } else {
            return NextResponse.json({ error: "Unsupported database type" }, { status: 400 })
        }
    } catch (e: any) {
        console.error("Schema fetch error:", e)
        return NextResponse.json({ error: e.message || "Failed to fetch schema" }, { status: 500 })
    }
}
