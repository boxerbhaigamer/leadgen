export default function Footer() {
    return (
        <footer
            style={{
                borderTop: "1px solid var(--color-border)",
                padding: "60px 24px 32px",
                background: "var(--bg-footer)",
                transition: "background 0.4s ease",
            }}
        >
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 40,
                    marginBottom: 48,
                }}
            >
                {/* Brand */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <span style={{ fontSize: 24 }}>⚡</span>
                        <span style={{ fontSize: "1.2rem", fontWeight: 800 }} className="text-gradient">
                            LeadGen
                        </span>
                    </div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", lineHeight: 1.6, maxWidth: 250 }}>
                        India&apos;s smartest lead generation platform. Scrape, organize, and export business leads effortlessly.
                    </p>
                </div>

                {/* Product */}
                <div>
                    <h4 style={headingStyle}>Product</h4>
                    <ul style={listStyle}>
                        <li><a href="#features" style={footerLink}>Features</a></li>
                        <li><a href="#pricing" style={footerLink}>Pricing</a></li>
                        <li><a href="#platforms" style={footerLink}>Platforms</a></li>
                        <li><a href="/download" style={footerLink}>Download Agent</a></li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h4 style={headingStyle}>Company</h4>
                    <ul style={listStyle}>
                        <li><a href="/about" style={footerLink}>About Us</a></li>
                        <li><a href="/contact" style={footerLink}>Contact</a></li>
                        <li><a href="/privacy" style={footerLink}>Privacy Policy</a></li>
                        <li><a href="/terms" style={footerLink}>Terms of Service</a></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 style={headingStyle}>Support</h4>
                    <ul style={listStyle}>
                        <li><a href="#faq" style={footerLink}>FAQ</a></li>
                        <li><a href="/docs" style={footerLink}>Documentation</a></li>
                        <li><a href="mailto:support@leadgen.in" style={footerLink}>Email Support</a></li>
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div
                style={{
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: 24,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 16,
                }}
            >
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                    © 2026 LeadGen. All rights reserved.
                </p>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                    Made with ❤️ in India
                </p>
            </div>
        </footer>
    );
}

const headingStyle = {
    fontSize: "0.85rem",
    fontWeight: 700,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--color-text-muted)",
};

const listStyle = { listStyle: "none", padding: 0, display: "grid", gap: 10 };

const footerLink = {
    color: "var(--color-text-muted)",
    textDecoration: "none",
    fontSize: "0.85rem",
    transition: "color 0.2s",
};
