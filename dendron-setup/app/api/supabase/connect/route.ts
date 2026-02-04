import { NextResponse } from "next/server"

export async function GET() {
    // Regex: keep only letters, numbers, hyphens, and underscores
    const clean = (val: string | undefined) => val?.replace(/[^a-zA-Z0-9\-_]/g, '') || ""

    const client_id = clean(process.env.SUPABASE_OAUTH_CLIENT_ID)
    const redirect_uri = process.env.SUPABASE_OAUTH_REDIRECT_URI?.trim().replace(/^["']|["']$/g, '')

    if (!client_id || !redirect_uri) {
        return NextResponse.json({
            error: "OAUTH details not configured on server",
            debug: { has_cid: !!client_id, has_red: !!redirect_uri }
        }, { status: 500 })
    }

    const scope = "projects:read projects:write functions:read functions:write database:read database:write organizations:read"
    // Note: Error message asked for 'projects:read', so we must use colons. 'all' might be restricted.

    const supabaseAuthUrl = new URL("https://api.supabase.com/v1/oauth/authorize")
    supabaseAuthUrl.searchParams.append("client_id", client_id)
    supabaseAuthUrl.searchParams.append("redirect_uri", redirect_uri)
    supabaseAuthUrl.searchParams.append("response_type", "code")
    supabaseAuthUrl.searchParams.append("scope", scope)

    return NextResponse.redirect(supabaseAuthUrl.toString())
}
