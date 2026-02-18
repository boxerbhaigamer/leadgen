const features = [
    {
        icon: "🖥️",
        iconBg: "rgba(108, 92, 231, 0.15)",
        title: "Runs on Your PC",
        desc: "The browser opens right on your machine — watch scraping happen live. No cloud servers, no hidden costs.",
    },
    {
        icon: "🔍",
        iconBg: "rgba(0, 206, 201, 0.15)",
        title: "Multi-Platform Scraping",
        desc: "One tool for Google Maps, Justdial, and IndiaMART. More platforms coming soon.",
    },
    {
        icon: "🧹",
        iconBg: "rgba(254, 202, 87, 0.15)",
        title: "Auto Deduplication",
        desc: "Intelligent duplicate detection ensures your lead list is always clean and unique.",
    },
    {
        icon: "📊",
        iconBg: "rgba(108, 92, 231, 0.15)",
        title: "Smart Categorization",
        desc: "Leads auto-sorted into Hot Leads (no website), Has Website, and High Value tabs.",
    },
    {
        icon: "📥",
        iconBg: "rgba(0, 206, 201, 0.15)",
        title: "Export Anywhere",
        desc: "Download your leads as CSV, JSON, or Excel. Use them in any CRM or outreach tool.",
    },
    {
        icon: "⚡",
        iconBg: "rgba(255, 107, 107, 0.15)",
        title: "Resume & Schedule",
        desc: "Interrupted? Resume where you left off. Paid users can schedule recurring scrapes.",
    },
];

export default function Features() {
    return (
        <section
            id="features"
            className="bg-gradient-section"
            style={{ padding: "100px 24px" }}
        >
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                {/* Section Header */}
                <div style={{ textAlign: "center", marginBottom: 60 }}>
                    <h2
                        style={{
                            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                            marginBottom: 16,
                        }}
                    >
                        Everything You Need to{" "}
                        <span className="text-gradient">Generate Leads</span>
                    </h2>
                    <p
                        style={{
                            color: "var(--color-text-muted)",
                            fontSize: "1.05rem",
                            maxWidth: 500,
                            margin: "0 auto",
                        }}
                    >
                        Powerful features designed for marketers, agencies, and freelancers
                        across India.
                    </p>
                </div>

                {/* Feature Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: 24,
                    }}
                >
                    {features.map((f, i) => (
                        <div key={i} className="glass-card" style={{ padding: 28 }}>
                            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                <div
                                    className="feature-icon"
                                    style={{ background: f.iconBg }}
                                >
                                    {f.icon}
                                </div>
                                <div>
                                    <h3
                                        style={{
                                            fontSize: "1.1rem",
                                            fontWeight: 700,
                                            marginBottom: 8,
                                        }}
                                    >
                                        {f.title}
                                    </h3>
                                    <p
                                        style={{
                                            color: "var(--color-text-muted)",
                                            fontSize: "0.9rem",
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {f.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
