import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    // Next.js convention: redirect to the success page with the code in the URL
    // The success page will then call /api/supabase/provision
    return NextResponse.redirect(new URL(`/success?code=${code}`, request.url))
}
