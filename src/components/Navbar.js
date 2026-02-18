"use client";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="glass-nav" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}>
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "0 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 70,
                }}
            >
                {/* Logo */}
                <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28, lineHeight: 1 }}>⚡</span>
                    <span style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.02em" }} className="text-gradient">
                        LeadGen
                    </span>
                </a>

                {/* Desktop Links */}
                <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="desktop-nav">
                    <a href="#features" style={linkStyle}>Features</a>
                    <a href="#platforms" style={linkStyle}>Platforms</a>
                    <a href="#pricing" style={linkStyle}>Pricing</a>
                    <a href="#faq" style={linkStyle}>FAQ</a>
                    <a href="/login" style={linkStyle}>Dashboard</a>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        aria-label="Toggle theme"
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        <div className="theme-toggle-knob">
                            {theme === "dark" ? "🌙" : "☀️"}
                        </div>
                    </button>

                    <a href="/login" className="btn-secondary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
                        Log In
                    </a>
                    <a href="/signup" className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
                        Get Started Free
                    </a>
                </div>

                {/* Mobile: Toggle + Hamburger */}
                <div style={{ display: "none", alignItems: "center", gap: 12 }} className="mobile-controls">
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        aria-label="Toggle theme"
                    >
                        <div className="theme-toggle-knob">
                            {theme === "dark" ? "🌙" : "☀️"}
                        </div>
                    </button>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--color-text)",
                            fontSize: 24,
                            cursor: "pointer",
                        }}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? "✕" : "☰"}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div
                    style={{
                        padding: "16px 24px 24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        borderTop: "1px solid var(--color-border)",
                        background: "var(--bg-nav)",
                        backdropFilter: "blur(24px)",
                    }}
                >
                    <a href="#features" style={linkStyle} onClick={() => setMenuOpen(false)}>Features</a>
                    <a href="#platforms" style={linkStyle} onClick={() => setMenuOpen(false)}>Platforms</a>
                    <a href="#pricing" style={linkStyle} onClick={() => setMenuOpen(false)}>Pricing</a>
                    <a href="#faq" style={linkStyle} onClick={() => setMenuOpen(false)}>FAQ</a>
                    <a href="/login" style={linkStyle} onClick={() => setMenuOpen(false)}>Dashboard</a>
                    <a href="/login" className="btn-secondary" style={{ textAlign: "center", justifyContent: "center" }}>
                        Log In
                    </a>
                    <a href="/signup" className="btn-primary" style={{ textAlign: "center", justifyContent: "center" }}>
                        Get Started Free
                    </a>
                </div>
            )}

            <style jsx>{`
        .desktop-nav { display: flex !important; }
        .mobile-controls { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-controls { display: flex !important; }
        }
      `}</style>
        </nav>
    );
}

const linkStyle = {
    color: "var(--color-text-muted)",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "color 0.2s",
};
