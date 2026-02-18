import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    try {
        if (code) {
            const supabase = await createClient();
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error) {
                return NextResponse.redirect(`${origin}${next}`);
            }
            throw new Error(error.message);
        }
    } catch (err) {
        console.error("Auth Callback Error:", err);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(err.message)}`);
    }

    // If no code, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=no_code_provided`);
}
