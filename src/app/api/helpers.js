import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Server-side Supabase client with service-level access for API key auth
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

// Authenticate agent by API key → returns user profile
export async function authenticateAgent(request) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return { error: "Missing or invalid Authorization header", status: 401 };
    }

    const apiKey = authHeader.slice(7);
    const supabase = getSupabaseAdmin();

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("api_key", apiKey)
        .single();

    if (error || !profile) {
        return { error: "Invalid API key", status: 401 };
    }

    return { profile, supabase };
}

export function errorResponse(message, status = 400) {
    return NextResponse.json({ error: message }, { status });
}

export function successResponse(data, status = 200) {
    return NextResponse.json(data, { status });
}
