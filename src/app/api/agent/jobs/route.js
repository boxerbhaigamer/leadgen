import { authenticateAgent, errorResponse, successResponse } from "@/app/api/helpers";

// GET /api/agent/jobs — Get pending jobs for the agent
export async function GET(request) {
    const auth = await authenticateAgent(request);
    if (auth.error) return errorResponse(auth.error, auth.status);

    const { supabase, profile } = auth;

    const { data: jobs, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("user_id", profile.id)
        .in("status", ["pending", "running"])
        .order("created_at", { ascending: true });

    if (error) return errorResponse(error.message, 500);
    return successResponse({ jobs });
}

// POST /api/agent/jobs — Create a new job
export async function POST(request) {
    const auth = await authenticateAgent(request);
    if (auth.error) return errorResponse(auth.error, auth.status);

    const { supabase, profile } = auth;
    const body = await request.json();

    const { platform, city, category } = body;
    if (!platform || !city || !category) {
        return errorResponse("Missing required fields: platform, city, category");
    }

    const { data: job, error } = await supabase
        .from("jobs")
        .insert({ user_id: profile.id, platform, city, category })
        .select()
        .single();

    if (error) return errorResponse(error.message, 500);
    return successResponse({ job }, 201);
}

// PATCH /api/agent/jobs — Update job status
export async function PATCH(request) {
    const auth = await authenticateAgent(request);
    if (auth.error) return errorResponse(auth.error, auth.status);

    const { supabase, profile } = auth;
    const body = await request.json();

    const { job_id, status, leads_found } = body;
    if (!job_id || !status) {
        return errorResponse("Missing required fields: job_id, status");
    }

    const updates = { status };
    if (leads_found !== undefined) updates.leads_found = leads_found;
    if (status === "completed" || status === "stopped") updates.completed_at = new Date().toISOString();

    const { data: job, error } = await supabase
        .from("jobs")
        .update(updates)
        .eq("id", job_id)
        .eq("user_id", profile.id)
        .select()
        .single();

    if (error) return errorResponse(error.message, 500);
    return successResponse({ job });
}
