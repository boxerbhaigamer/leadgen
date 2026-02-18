import { authenticateAgent, errorResponse, successResponse } from "@/app/api/helpers";

// POST /api/agent/leads — Upload scraped leads (batch)
export async function POST(request) {
    const auth = await authenticateAgent(request);
    if (auth.error) return errorResponse(auth.error, auth.status);

    const { supabase, profile } = auth;
    const body = await request.json();

    const { job_id, leads } = body;
    if (!job_id || !leads || !Array.isArray(leads) || leads.length === 0) {
        return errorResponse("Missing required fields: job_id, leads (array)");
    }

    // Add user_id and job_id to each lead
    const leadsToInsert = leads.map((lead) => ({
        user_id: profile.id,
        job_id,
        business_name: lead.business_name || lead.name || "Unknown",
        phone: lead.phone || null,
        email: lead.email || null,
        address: lead.address || null,
        city: lead.city || null,
        rating: (lead.rating && !isNaN(parseFloat(lead.rating))) ? parseFloat(lead.rating) : null,
        reviews: (lead.reviews && !isNaN(parseInt(lead.reviews))) ? parseInt(lead.reviews) : 0,
        website: lead.website || null,
        category: lead.category || null,
        platform: lead.platform || null,
        has_website: !!(lead.website),
        is_hot: !!(lead.phone && lead.email),
        is_high_value: !!(lead.rating && parseFloat(lead.rating) >= 4.0 && lead.reviews && parseInt(lead.reviews) >= 50),
        raw_data: lead,
    }));

    const { data, error } = await supabase
        .from("leads")
        .insert(leadsToInsert)
        .select();

    if (error) return errorResponse(error.message, 500);

    // Update job leads_found count
    const { data: currentJob } = await supabase
        .from("jobs")
        .select("leads_found")
        .eq("id", job_id)
        .single();

    await supabase
        .from("jobs")
        .update({ leads_found: (currentJob?.leads_found || 0) + leadsToInsert.length })
        .eq("id", job_id);

    // Update profile leads_count
    await supabase
        .from("profiles")
        .update({ leads_count: profile.leads_count + leadsToInsert.length })
        .eq("id", profile.id);

    return successResponse({
        inserted: data.length,
        message: `${data.length} leads uploaded successfully`,
    }, 201);
}
