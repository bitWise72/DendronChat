import { FastifyInstance } from "fastify"
import { Db } from "mongodb"

declare module "fastify" {
    interface FastifyInstance {
        mongo: {
            db: Db
            client: any
            ObjectId: any
        }
    }
}
