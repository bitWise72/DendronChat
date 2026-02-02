import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

export function getSupabase() {
    const url = process.env.SUPABASE_URL as string
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string

    if (!url || !key) {
        throw new Error("Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.")
    }

    return createClient(url, key)
}
