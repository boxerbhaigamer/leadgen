import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ---- PROFILE ----
export async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    return data;
}

export async function updateProfile(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single();
    if (error) throw error;
    return data;
}

// ---- JOBS ----
export async function getJobs() {
    const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function createJob({ platform, city, category }) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("jobs").insert({
        user_id: user.id,
        platform,
        city,
        category,
    }).select().single();
    if (error) throw error;
    return data;
}

export async function updateJob(jobId, updates) {
    const { data, error } = await supabase.from("jobs").update(updates).eq("id", jobId).select().single();
    if (error) throw error;
    return data;
}

export async function stopJob(jobId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("jobs")
        .update({ status: "stopped", completed_at: new Date().toISOString() })
        .eq("id", jobId)
        .eq("user_id", user.id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ---- LEADS ----
export async function getLeads(filter = "all") {
    let query = supabase.from("leads").select("*").order("created_at", { ascending: false });

    if (filter === "hot") query = query.eq("is_hot", true);
    if (filter === "website") query = query.eq("has_website", true);
    if (filter === "high_value") query = query.eq("is_high_value", true);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function getLeadsByJob(jobId) {
    const { data, error } = await supabase.from("leads").select("*").eq("job_id", jobId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function getLeadsCount() {
    const { count } = await supabase.from("leads").select("*", { count: "exact", head: true });
    return count || 0;
}

export async function getHotLeadsCount() {
    const { count } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("is_hot", true);
    return count || 0;
}

// ---- STATS ----
export async function getDashboardStats() {
    const [totalLeads, hotLeads, profile, jobs] = await Promise.all([
        getLeadsCount(),
        getHotLeadsCount(),
        getProfile(),
        getJobs(),
    ]);

    return {
        totalLeads,
        hotLeads,
        jobsRun: jobs.length,
        plan: profile?.plan || "free",
        recentJobs: jobs.slice(0, 5),
    };
}

// ---- AUTH ----
export async function signOut() {
    await supabase.auth.signOut();
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}
