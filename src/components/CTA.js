export default function CTA() {
    return (
        <section style={{ padding: "80px 24px", background: "var(--bg-body)", transition: "background 0.4s ease" }}>
            <div
                className="bg-gradient-cta"
                style={{
                    maxWidth: 900,
                    margin: "0 auto",
                    borderRadius: 24,
                    padding: "60px 40px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Decorative circles */}
                <div
                    style={{
                        position: "absolute",
                        top: -40,
                        right: -40,
                        width: 200,
                        height: 200,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.08)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: -30,
                        left: -30,
                        width: 150,
                        height: 150,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.05)",
                    }}
                />

                <h2
                    style={{
                        fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                        fontWeight: 800,
                        color: "white",
                        marginBottom: 16,
                        position: "relative",
                    }}
                >
                    Ready to Start Generating Leads?
                </h2>
                <p
                    style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "1.05rem",
                        maxWidth: 450,
                        margin: "0 auto 28px",
                        lineHeight: 1.6,
                        position: "relative",
                    }}
                >
                    Join hundreds of businesses already using LeadGen to find clients across India.
                </p>
                <a
                    href="/signup"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "white",
                        color: "#6C5CE7",
                        padding: "14px 32px",
                        borderRadius: 14,
                        fontWeight: 700,
                        fontSize: "1rem",
                        textDecoration: "none",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        position: "relative",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                    }}
                >
                    🎯 Get Started Free — No Credit Card
                </a>
            </div>
        </section>
    );
}
