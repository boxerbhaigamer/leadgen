
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10)}...`
            : "MISSING",
        anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? `Present (Length: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length})`
            : "MISSING",
        service_role: process.env.SUPABASE_SERVICE_ROLE_KEY
            ? `Present (Length: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length})`
            : "MISSING",
        node_env: process.env.NODE_ENV,
    });
}
