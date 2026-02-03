import { NextResponse } from "next/server"

export async function GET() {
    const client_id = process.env.SUPABASE_OAUTH_CLIENT_ID
    const redirect_uri = process.env.SUPABASE_OAUTH_REDIRECT_URI

    if (!client_id || !redirect_uri) {
        return NextResponse.json({ error: "OAUTH details not configured on server" }, { status: 500 })
    }

    const scope = [
        "organizations.read",
        "projects.read",
        "projects.create",
        "projects.write",
        "database.write",
        "functions.write"
    ].join(" ")

    const supabaseAuthUrl = new URL("https://api.supabase.com/v1/oauth/authorize")
    supabaseAuthUrl.searchParams.append("client_id", client_id)
    supabaseAuthUrl.searchParams.append("redirect_uri", redirect_uri)
    supabaseAuthUrl.searchParams.append("response_type", "code")
    supabaseAuthUrl.searchParams.append("scope", scope)

    return NextResponse.redirect(supabaseAuthUrl.toString())
}
