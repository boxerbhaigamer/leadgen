const platforms = [
    {
        name: "Google Maps",
        icon: "📍",
        status: "Live",
        statusColor: "#00CEC9",
        fields: ["Business Name", "Rating", "Reviews", "Phone", "Address", "Website", "Email", "Category"],
        desc: "Scrape any business category in any Indian city. Scroll through all results automatically.",
    },
    {
        name: "Justdial",
        icon: "📖",
        status: "Live",
        statusColor: "#00CEC9",
        fields: ["Business Name", "Phone", "Address", "Rating", "Category", "City"],
        desc: "India's largest business directory. Extract verified phone numbers and business details.",
    },
    {
        name: "IndiaMART",
        icon: "🏭",
        status: "Live",
        statusColor: "#00CEC9",
        fields: ["Supplier Name", "Products", "Phone", "City", "Verified Status"],
        desc: "Find manufacturers, suppliers, and wholesalers across India.",
    },
    {
        name: "Instagram",
        icon: "📸",
        status: "Coming Soon",
        statusColor: "#FECA57",
        fields: ["Profile Name", "Bio", "Email", "Followers", "Category"],
        desc: "Extract business profiles, bio emails, and contact info from Instagram.",
    },
    {
        name: "LinkedIn",
        icon: "💼",
        status: "Coming Soon",
        statusColor: "#FECA57",
        fields: ["Company Name", "Industry", "Employees", "Website", "Location"],
        desc: "Find companies, decision-makers, and job postings on LinkedIn.",
    },
];

export default function Platforms() {
    return (
        <section
            id="platforms"
            style={{ padding: "100px 24px", background: "var(--bg-body)", transition: "background 0.4s ease" }}
        >
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 60 }}>
                    <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
                        Scrape From <span className="text-gradient">Multiple Platforms</span>
                    </h2>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "1.05rem", maxWidth: 500, margin: "0 auto" }}>
                        One tool, many sources. Extract leads from India&apos;s most popular business directories.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
                    {platforms.map((p, i) => (
                        <div
                            key={i}
                            className="glass-card"
                            style={{ padding: 28, opacity: p.status === "Coming Soon" ? 0.6 : 1 }}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <span style={{ fontSize: 28 }}>{p.icon}</span>
                                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>{p.name}</h3>
                                </div>
                                <span
                                    style={{
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        padding: "4px 10px",
                                        borderRadius: 6,
                                        background: `${p.statusColor}20`,
                                        color: p.statusColor,
                                    }}
                                >
                                    {p.status}
                                </span>
                            </div>
                            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 16 }}>
                                {p.desc}
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {p.fields.map((field, j) => (
                                    <span
                                        key={j}
                                        style={{
                                            fontSize: "0.75rem",
                                            padding: "3px 8px",
                                            borderRadius: 6,
                                            background: "var(--bg-surface-lighter)",
                                            color: "var(--color-text-muted)",
                                            transition: "background 0.4s ease",
                                        }}
                                    >
                                        {field}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
