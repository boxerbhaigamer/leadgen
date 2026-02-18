const plans = [
    {
        name: "Free",
        price: "₹0",
        period: "forever",
        desc: "Perfect for getting started",
        popular: false,
        features: [
            { text: "Google Maps scraping", included: true },
            { text: "Basic fields (Name, Phone, Address)", included: true },
            { text: "500 leads storage", included: true },
            { text: "CSV export", included: true },
            { text: "Auto deduplication", included: true },
            { text: "1 job at a time", included: true },
            { text: "Multi-platform scraping", included: false },
            { text: "Email & Website fields", included: false },
            { text: "Scheduled scraping", included: false },
            { text: "JSON & Excel export", included: false },
        ],
        cta: "Get Started Free",
        ctaStyle: "btn-secondary",
    },
    {
        name: "Pro",
        price: "₹999",
        period: "/month",
        desc: "For serious lead generators",
        popular: true,
        features: [
            { text: "Google Maps + Justdial + IndiaMART", included: true },
            { text: "All data fields unlocked", included: true },
            { text: "Unlimited leads storage", included: true },
            { text: "CSV + JSON + Excel export", included: true },
            { text: "Auto deduplication", included: true },
            { text: "Multiple simultaneous jobs", included: true },
            { text: "Scheduled recurring scrapes", included: true },
            { text: "Priority support", included: true },
            { text: "WhatsApp check (coming soon)", included: true },
            { text: "New platforms first access", included: true },
        ],
        cta: "Start Pro Trial",
        ctaStyle: "btn-primary",
    },
];

export default function Pricing() {
    return (
        <section
            id="pricing"
            style={{ padding: "100px 24px", background: "var(--bg-body)", transition: "background 0.4s ease" }}
        >
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 60 }}>
                    <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
                        Simple, Transparent <span className="text-gradient">Pricing</span>
                    </h2>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "1.05rem", maxWidth: 450, margin: "0 auto" }}>
                        Start free, upgrade when you need more power.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`glass-card ${plan.popular ? "animate-pulse-glow" : ""}`}
                            style={{
                                padding: 32,
                                border: plan.popular ? "1px solid rgba(108, 92, 231, 0.5)" : undefined,
                                position: "relative",
                            }}
                        >
                            {plan.popular && (
                                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)" }}>
                                    <span className="badge-popular">⭐ Most Popular</span>
                                </div>
                            )}

                            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 4, marginTop: plan.popular ? 8 : 0 }}>
                                {plan.name}
                            </h3>
                            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: 20 }}>
                                {plan.desc}
                            </p>

                            <div style={{ marginBottom: 24 }}>
                                <span
                                    style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.02em" }}
                                    className={plan.popular ? "text-gradient" : ""}
                                >
                                    {plan.price}
                                </span>
                                <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginLeft: 4 }}>
                                    {plan.period}
                                </span>
                            </div>

                            <ul style={{ listStyle: "none", padding: 0, marginBottom: 28 }}>
                                {plan.features.map((f, j) => (
                                    <li
                                        key={j}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            padding: "6px 0",
                                            fontSize: "0.9rem",
                                            color: f.included ? "var(--color-text)" : "var(--color-text-muted)",
                                            opacity: f.included ? 1 : 0.4,
                                        }}
                                    >
                                        <span style={{ fontSize: "0.8rem" }}>{f.included ? "✅" : "❌"}</span>
                                        {f.text}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="/signup"
                                className={plan.ctaStyle}
                                style={{ width: "100%", justifyContent: "center", padding: "12px 24px" }}
                            >
                                {plan.cta}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
