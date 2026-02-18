"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { getDashboardStats, getLeads, getJobs, createJob, stopJob, signOut, getProfile, getCurrentUser } from "@/lib/api";

export default function DashboardPage() {
    const [activePage, setActivePage] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: "📊" },
        { id: "new-job", label: "New Job", icon: "🔍" },
        { id: "leads", label: "All Leads", icon: "📋" },
        { id: "hot", label: "Hot Leads", icon: "🔥" },
        { id: "website", label: "Has Website", icon: "🌐" },
        { id: "high_value", label: "High Value", icon: "⭐" },
        { id: "export", label: "Export", icon: "📥" },
        { id: "settings", label: "Settings", icon: "⚙️" },
    ];

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-body)", transition: "background 0.4s ease" }}>
            {/* Sidebar */}
            <aside
                className="glass-card"
                style={{
                    width: sidebarOpen ? 260 : 72,
                    minHeight: "100vh",
                    borderRadius: 0,
                    borderRight: "1px solid var(--color-border)",
                    padding: "20px 12px",
                    display: "flex",
                    flexDirection: "column",
                    transition: "width 0.3s ease",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 50,
                    overflow: "hidden",
                }}
            >
                {/* Logo + collapse */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, padding: "0 4px" }}>
                    {sidebarOpen && (
                        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                            <span style={{ fontSize: 24 }}>⚡</span>
                            <span className="text-gradient" style={{ fontSize: "1.2rem", fontWeight: 800 }}>LeadGen</span>
                        </a>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: 18, cursor: "pointer", padding: 4 }}
                    >
                        {sidebarOpen ? "◀" : "▶"}
                    </button>
                </div>

                {/* Nav items */}
                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: "none",
                                background: activePage === item.id ? "var(--color-primary)" : "transparent",
                                color: activePage === item.id ? "white" : "var(--color-text-muted)",
                                fontSize: "0.9rem",
                                fontWeight: activePage === item.id ? 600 : 400,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                textAlign: "left",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                            {sidebarOpen && item.label}
                        </button>
                    ))}
                </nav>

                {/* Bottom controls */}
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    {sidebarOpen && (
                        <a
                            href="/leadgen-agent.exe"
                            download
                            className="btn-primary"
                            style={{
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                fontSize: "0.85rem",
                                marginBottom: 8,
                                background: "var(--color-primary)",
                                color: "white"
                            }}
                        >
                            <span>⚡ Download Agent</span>
                        </a>
                    )}

                    <button onClick={toggleTheme} className="theme-toggle" style={{ alignSelf: sidebarOpen ? "flex-start" : "center" }}>
                        <div className="theme-toggle-knob">{theme === "dark" ? "🌙" : "☀️"}</div>
                    </button>
                    {sidebarOpen && (
                        <button onClick={handleSignOut} style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "0.85rem", cursor: "pointer", textAlign: "left", padding: "6px 4px" }}>
                            🚪 Sign Out
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, marginLeft: sidebarOpen ? 260 : 72, padding: 32, transition: "margin-left 0.3s ease" }}>
                {activePage === "dashboard" && <DashboardHome />}
                {activePage === "new-job" && <NewJobPage />}
                {(activePage === "leads" || activePage === "hot" || activePage === "website" || activePage === "high_value") && (
                    <LeadsPage filter={activePage === "leads" ? "all" : activePage} />
                )}
                {activePage === "export" && <ExportPage />}
                {activePage === "settings" && <SettingsPage />}
            </main>
        </div>
    );
}

// ===================== DASHBOARD HOME =====================
function DashboardHome() {
    const [stats, setStats] = useState({ totalLeads: 0, hotLeads: 0, jobsRun: 0, plan: "free", recentJobs: [] });
    const [loading, setLoading] = useState(true);
    const [stoppingJobId, setStoppingJobId] = useState(null);

    const loadStats = useCallback(() => {
        getDashboardStats().then((data) => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    const handleStopJob = async (jobId) => {
        setStoppingJobId(jobId);
        try {
            await stopJob(jobId);
            loadStats();
        } catch (err) {
            console.error("Failed to stop job:", err);
        }
        setStoppingJobId(null);
    };

    const statCards = [
        { label: "Total Leads", value: stats.totalLeads, icon: "📋", color: "#6C5CE7" },
        { label: "Hot Leads", value: stats.hotLeads, icon: "🔥", color: "#FF6B6B" },
        { label: "Jobs Run", value: stats.jobsRun, icon: "🔍", color: "#00CEC9" },
        { label: "Plan", value: stats.plan === "pro" ? "Pro ⭐" : "Free", icon: "💎", color: "#FDCB6E" },
    ];

    return (
        <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 24 }}>Dashboard</h1>
            {loading ? (
                <p style={{ color: "var(--color-text-muted)" }}>Loading stats...</p>
            ) : (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
                        {statCards.map((s) => (
                            <div key={s.label} className="glass-card" style={{ padding: "20px 24px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <span style={{ fontSize: 28 }}>{s.icon}</span>
                                    <span style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</span>
                                </div>
                                <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16 }}>Recent Jobs</h2>
                    {stats.recentJobs.length === 0 ? (
                        <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
                            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>No jobs yet. Create your first job to start scraping leads!</p>
                        </div>
                    ) : (
                        <div className="glass-card" style={{ overflow: "hidden" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                                        {["Platform", "City", "Category", "Status", "Leads", "Date", ""].map((h) => (
                                            <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentJobs.map((job) => (
                                        <tr key={job.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                            <td style={tdStyle}>{platformLabel(job.platform)}</td>
                                            <td style={tdStyle}>{job.city}</td>
                                            <td style={tdStyle}>{job.category}</td>
                                            <td style={tdStyle}><StatusBadge status={job.status} /></td>
                                            <td style={tdStyle}>{job.leads_found}</td>
                                            <td style={tdStyle}>{new Date(job.created_at).toLocaleDateString()}</td>
                                            <td style={tdStyle}>
                                                {(job.status === "pending" || job.status === "running") && (
                                                    <button
                                                        onClick={() => handleStopJob(job.id)}
                                                        disabled={stoppingJobId === job.id}
                                                        style={{
                                                            padding: "5px 14px",
                                                            borderRadius: 8,
                                                            border: "1px solid rgba(255,107,107,0.4)",
                                                            background: "rgba(255,107,107,0.1)",
                                                            color: "#FF6B6B",
                                                            fontSize: "0.78rem",
                                                            fontWeight: 600,
                                                            cursor: stoppingJobId === job.id ? "not-allowed" : "pointer",
                                                            transition: "all 0.2s ease",
                                                            opacity: stoppingJobId === job.id ? 0.5 : 1,
                                                        }}
                                                    >
                                                        {stoppingJobId === job.id ? "Stopping..." : "⏹ Stop"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ===================== NEW JOB PAGE =====================
function NewJobPage() {
    const [platform, setPlatform] = useState("google_maps");
    const [city, setCity] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await createJob({ platform, city, category });
            setSuccess(`Job created! Scraping ${category} in ${city} from ${platformLabel(platform)}.`);
            setCity("");
            setCategory("");
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const platforms = [
        { id: "google_maps", label: "📍 Google Maps", free: true },
        { id: "justdial", label: "📖 Justdial", free: false },
        { id: "indiamart", label: "🏭 IndiaMART", free: false },
    ];

    return (
        <div style={{ maxWidth: 600 }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 24 }}>New Scraping Job</h1>

            {error && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: "0.85rem", color: "#FF6B6B" }}>{error}</div>}
            {success && <div style={{ background: "rgba(0,206,201,0.1)", border: "1px solid rgba(0,206,201,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: "0.85rem", color: "#00CEC9" }}>{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                    <label style={formLabel}>Platform</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                        {platforms.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setPlatform(p.id)}
                                style={{
                                    padding: "14px 12px",
                                    borderRadius: 12,
                                    border: platform === p.id ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                                    background: platform === p.id ? "rgba(108,92,231,0.1)" : "var(--bg-surface-lighter)",
                                    color: "var(--color-text)",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    position: "relative",
                                }}
                            >
                                {p.label}
                                {!p.free && <span style={{ display: "block", fontSize: "0.7rem", color: "#FDCB6E", marginTop: 4 }}>PRO</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                    <label style={formLabel}>City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g., Mumbai, Delhi, Bangalore" style={formInput} required />

                    <label style={{ ...formLabel, marginTop: 16 }}>Business Category</label>
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Restaurants, Dentists, Hotels" style={formInput} required />
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "1rem", opacity: loading ? 0.6 : 1 }}>
                    {loading ? "Creating Job..." : "🚀 Start Scraping"}
                </button>
            </form>
        </div>
    );
}

// ===================== LEADS PAGE =====================
function LeadsPage({ filter }) {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setLoading(true);
        getLeads(filter).then((data) => { setLeads(data); setLoading(false); }).catch(() => setLoading(false));
    }, [filter]);

    const filterLabels = { all: "All Leads", hot: "Hot Leads 🔥", website: "Has Website 🌐", high_value: "High Value ⭐" };

    const filtered = leads.filter((l) =>
        l.business_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.phone?.includes(search) ||
        l.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>{filterLabels[filter] || "Leads"}</h1>
                <input
                    type="text"
                    placeholder="Search leads..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ ...formInput, maxWidth: 280, marginBottom: 0 }}
                />
            </div>

            {loading ? (
                <p style={{ color: "var(--color-text-muted)" }}>Loading leads...</p>
            ) : filtered.length === 0 ? (
                <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
                    <p style={{ fontSize: 48, marginBottom: 12 }}>📭</p>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "1rem" }}>No leads found. Create a scraping job to start collecting leads!</p>
                </div>
            ) : (
                <div className="glass-card" style={{ overflow: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                                {["Business", "Phone", "Email", "City", "Rating", "Website", "Tags"].map((h) => (
                                    <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((lead) => (
                                <tr key={lead.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                    <td style={tdStyle}><strong>{lead.business_name}</strong></td>
                                    <td style={tdStyle}>{lead.phone || "—"}</td>
                                    <td style={tdStyle}>{lead.email || "—"}</td>
                                    <td style={tdStyle}>{lead.city || "—"}</td>
                                    <td style={tdStyle}>{lead.rating ? `⭐ ${lead.rating}` : "—"}</td>
                                    <td style={tdStyle}>
                                        {lead.website ? <a href={lead.website} target="_blank" style={{ color: "var(--color-primary-light)", textDecoration: "none" }}>Visit ↗</a> : "—"}
                                    </td>
                                    <td style={tdStyle}>
                                        {lead.is_hot && <span style={tagStyle("#FF6B6B")}>Hot</span>}
                                        {lead.has_website && <span style={tagStyle("#00CEC9")}>Web</span>}
                                        {lead.is_high_value && <span style={tagStyle("#FDCB6E")}>HV</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 12 }}>
                Showing {filtered.length} of {leads.length} leads
            </p>
        </div>
    );
}

// ===================== EXPORT PAGE =====================
function ExportPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLeads("all").then((data) => { setLeads(data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const downloadCSV = () => {
        if (leads.length === 0) return;
        const headers = ["Business Name", "Phone", "Email", "Address", "City", "Rating", "Reviews", "Website", "Category", "Platform"];
        const rows = leads.map((l) => [l.business_name, l.phone, l.email, l.address, l.city, l.rating, l.reviews, l.website, l.category, l.platform]);
        const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v || ""}"`).join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `leads_${new Date().toISOString().split("T")[0]}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    const downloadJSON = () => {
        if (leads.length === 0) return;
        const blob = new Blob([JSON.stringify(leads, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `leads_${new Date().toISOString().split("T")[0]}.json`; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ maxWidth: 600 }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 24 }}>Export Leads</h1>
            <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
                {loading ? "Loading..." : `${leads.length} leads available for export`}
            </p>

            <div style={{ display: "grid", gap: 16 }}>
                <div className="glass-card" style={{ padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h3 style={{ fontWeight: 700, marginBottom: 4 }}>📄 CSV</h3>
                        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Spreadsheet compatible</p>
                    </div>
                    <button onClick={downloadCSV} className="btn-primary" disabled={leads.length === 0} style={{ padding: "10px 20px" }}>Download</button>
                </div>
                <div className="glass-card" style={{ padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h3 style={{ fontWeight: 700, marginBottom: 4 }}>📋 JSON</h3>
                        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Developer friendly</p>
                    </div>
                    <button onClick={downloadJSON} className="btn-primary" disabled={leads.length === 0} style={{ padding: "10px 20px" }}>Download</button>
                </div>
                <div className="glass-card" style={{ padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.5 }}>
                    <div>
                        <h3 style={{ fontWeight: 700, marginBottom: 4 }}>📊 Excel</h3>
                        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Pro feature</p>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#FDCB6E", fontWeight: 600, background: "rgba(253,203,110,0.1)", padding: "6px 12px", borderRadius: 8 }}>PRO</span>
                </div>
            </div>
        </div>
    );
}

// ===================== SETTINGS PAGE =====================
function SettingsPage() {
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getProfile(), getCurrentUser()]).then(([p, u]) => {
            setProfile(p);
            setUser(u);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    return (
        <div style={{ maxWidth: 600 }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 24 }}>Settings</h1>
            {loading ? (
                <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
            ) : (
                <>
                    <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Account Info</h3>
                        <div style={{ display: "grid", gap: 12 }}>
                            <div>
                                <label style={formLabel}>Name</label>
                                <p style={{ color: "var(--color-text)", fontSize: "0.95rem" }}>{profile?.full_name || user?.user_metadata?.full_name || "—"}</p>
                            </div>
                            <div>
                                <label style={formLabel}>Email</label>
                                <p style={{ color: "var(--color-text)", fontSize: "0.95rem" }}>{user?.email || "—"}</p>
                            </div>
                            <div>
                                <label style={formLabel}>Plan</label>
                                <p style={{ color: profile?.plan === "pro" ? "#FDCB6E" : "var(--color-text)", fontSize: "0.95rem", fontWeight: 600 }}>
                                    {profile?.plan === "pro" ? "Pro ⭐" : "Free"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>API Key</h3>
                        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: 12 }}>
                            Use this key to connect your scraping agent.
                        </p>
                        <div style={{ ...formInput, fontFamily: "monospace", fontSize: "0.85rem", wordBreak: "break-all", background: "var(--bg-surface-lighter)" }}>
                            {profile?.api_key || "—"}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ===================== HELPERS =====================
function StatusBadge({ status }) {
    const colors = { pending: "#FDCB6E", running: "#6C5CE7", completed: "#00CEC9", failed: "#FF6B6B", stopped: "#E17055" };
    return (
        <span style={{
            padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600,
            background: `${colors[status] || "#999"}20`, color: colors[status] || "#999",
        }}>
            {status}
        </span>
    );
}

function platformLabel(p) {
    const map = { google_maps: "📍 Google Maps", justdial: "📖 Justdial", indiamart: "🏭 IndiaMART" };
    return map[p] || p;
}

function tagStyle(color) {
    return { padding: "2px 8px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 600, background: `${color}20`, color, marginRight: 4 };
}

const tdStyle = { padding: "12px 14px", fontSize: "0.85rem", color: "var(--color-text)" };
const formLabel = { display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, color: "var(--color-text)" };
const formInput = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--bg-surface-lighter)", color: "var(--color-text)", fontSize: "0.9rem", outline: "none" };
