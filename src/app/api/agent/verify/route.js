import { authenticateAgent, errorResponse, successResponse } from "@/app/api/helpers";

// GET /api/agent/verify — Verify API key and return profile info
export async function GET(request) {
    const auth = await authenticateAgent(request);
    if (auth.error) return errorResponse(auth.error, auth.status);

    const { profile } = auth;
    return successResponse({
        valid: true,
        user: {
            id: profile.id,
            name: profile.full_name,
            plan: profile.plan,
            leads_count: profile.leads_count,
            jobs_count: profile.jobs_count,
        },
    });
}
