export default function Hero() {
    return (
        <section
            className="bg-gradient-hero"
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                paddingTop: 90,
                paddingBottom: 60,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Floating orbs */}
            <div
                style={{
                    position: "absolute",
                    top: "10%",
                    right: "5%",
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(108,92,231,0.08) 0%, transparent 70%)",
                    filter: "blur(40px)",
                }}
                className="animate-float"
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "15%",
                    left: "10%",
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,206,201,0.06) 0%, transparent 70%)",
                    filter: "blur(30px)",
                }}
                className="animate-float delay-300"
            />

            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "0 24px",
                    width: "100%",
                    textAlign: "center",
                }}
            >
                {/* Badge */}
                <div
                    className="animate-fade-in-up"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 16px",
                        borderRadius: 24,
                        background: "rgba(108, 92, 231, 0.1)",
                        border: "1px solid rgba(108, 92, 231, 0.25)",
                        fontSize: "0.85rem",
                        color: "var(--color-primary-light)",
                        marginBottom: 24,
                    }}
                >
                    🚀 India&apos;s #1 Lead Generation Platform
                </div>

                {/* Headline */}
                <h1
                    className="animate-fade-in-up delay-100"
                    style={{
                        fontSize: "clamp(2.2rem, 5vw, 4rem)",
                        fontWeight: 900,
                        lineHeight: 1.1,
                        letterSpacing: "-0.03em",
                        marginBottom: 20,
                        opacity: 0,
                    }}
                >
                    Scrape Unlimited Business Leads
                    <br />
                    <span className="text-gradient">From Anywhere</span>
                </h1>

                {/* Subtitle */}
                <p
                    className="animate-fade-in-up delay-200"
                    style={{
                        fontSize: "clamp(1rem, 2vw, 1.25rem)",
                        color: "var(--color-text-muted)",
                        maxWidth: 600,
                        margin: "0 auto 32px",
                        lineHeight: 1.6,
                        opacity: 0,
                    }}
                >
                    Extract business names, phone numbers, emails, and more from Google Maps,
                    Justdial & IndiaMART. Runs on your PC — zero cloud costs.
                </p>

                {/* CTA Buttons */}
                <div
                    className="animate-fade-in-up delay-300"
                    style={{
                        display: "flex",
                        gap: 16,
                        justifyContent: "center",
                        flexWrap: "wrap",
                        marginBottom: 48,
                        opacity: 0,
                    }}
                >
                    <a href="/signup" className="btn-primary" style={{ padding: "14px 32px", fontSize: "1rem" }}>
                        🎯 Start Scraping Free
                    </a>
                    <a href="#features" className="btn-secondary" style={{ padding: "14px 32px", fontSize: "1rem" }}>
                        See How It Works ↓
                    </a>
                </div>

                {/* Platform tags */}
                <div
                    className="animate-fade-in-up delay-400"
                    style={{
                        display: "flex",
                        gap: 12,
                        justifyContent: "center",
                        flexWrap: "wrap",
                        marginBottom: 48,
                        opacity: 0,
                    }}
                >
                    <span className="platform-tag">📍 Google Maps</span>
                    <span className="platform-tag">📖 Justdial</span>
                    <span className="platform-tag">🏭 IndiaMART</span>
                    <span className="platform-tag" style={{ opacity: 0.5 }}>📸 Instagram (Coming Soon)</span>
                    <span className="platform-tag" style={{ opacity: 0.5 }}>💼 LinkedIn (Coming Soon)</span>
                </div>

                {/* Stats */}
                <div
                    className="animate-fade-in-up delay-500"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: 24,
                        maxWidth: 600,
                        margin: "0 auto",
                        opacity: 0,
                    }}
                >
                    <div style={{ textAlign: "center" }}>
                        <div className="stat-number text-gradient">10K+</div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: 4 }}>
                            Leads Scraped
                        </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div className="stat-number text-gradient">3</div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: 4 }}>
                            Platforms
                        </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div className="stat-number text-gradient">₹0</div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: 4 }}>
                            Cloud Costs
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
