const steps = [
    {
        num: "01",
        icon: "📝",
        title: "Sign Up & Download",
        desc: "Create a free account, then download the lightweight Windows agent.",
    },
    {
        num: "02",
        icon: "🔍",
        title: "Choose Your Target",
        desc: "Pick a platform, enter city and business category. Hit 'Start Scraping'.",
    },
    {
        num: "03",
        icon: "🖥️",
        title: "Watch It Work",
        desc: "The browser opens on your PC and scrapes leads in real-time. You see everything.",
    },
    {
        num: "04",
        icon: "📥",
        title: "Export & Profit",
        desc: "View leads on your dashboard, filter them, and export as CSV or JSON.",
    },
];

export default function HowItWorks() {
    return (
        <section
            className="bg-gradient-section"
            style={{ padding: "100px 24px" }}
        >
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 60 }}>
                    <h2
                        style={{
                            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                            marginBottom: 16,
                        }}
                    >
                        How It <span className="text-gradient">Works</span>
                    </h2>
                    <p
                        style={{
                            color: "var(--color-text-muted)",
                            fontSize: "1.05rem",
                            maxWidth: 450,
                            margin: "0 auto",
                        }}
                    >
                        From sign-up to leads in your inbox — in 4 simple steps.
                    </p>
                </div>

                <div style={{ display: "grid", gap: 20 }}>
                    {steps.map((s, i) => (
                        <div
                            key={i}
                            className="glass-card"
                            style={{
                                padding: "24px 28px",
                                display: "flex",
                                alignItems: "center",
                                gap: 20,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "1.5rem",
                                    fontWeight: 900,
                                    color: "var(--color-primary-light)",
                                    opacity: 0.3,
                                    minWidth: 40,
                                }}
                            >
                                {s.num}
                            </div>
                            <div style={{ fontSize: 28, flexShrink: 0 }}>{s.icon}</div>
                            <div>
                                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 4 }}>
                                    {s.title}
                                </h3>
                                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                                    {s.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
