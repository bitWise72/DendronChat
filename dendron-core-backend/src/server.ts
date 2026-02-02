import Fastify from "fastify"
import fastifyMongodb from "@fastify/mongodb"
import "dotenv/config"
import { projectRoutes } from "./routes/project.js"
import { chatRoutes } from "./routes/chat.js"
import { supabaseRoutes } from "./routes/supabase.js"
import { ingestRoute } from "./routes/ingest.js"
import { toolRoutes } from "./routes/tools.js"

const app = Fastify({ logger: true })

// Register MongoDB first
// We assume MONGO_URL includes the database name or we default to a specific one if possible, 
// but @fastify/mongodb will attach `app.mongo`.
try {
    await app.register(fastifyMongodb, {
        forceClose: true,
        url: process.env.MONGO_URL || "mongodb://localhost:27017/dendron"
    })
} catch (err) {
    console.error("Failed to connect to MongoDB. Ensure MongoDB is running.", err)
    process.exit(1)
}


await app.register(supabaseRoutes)
await app.register(projectRoutes)
await app.register(chatRoutes)
await app.register(ingestRoute)
await app.register(toolRoutes)

try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
} catch (err) {
    app.log.error(err)
    process.exit(1)
}
