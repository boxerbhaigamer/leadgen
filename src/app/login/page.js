"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const [method, setMethod] = useState("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/dashboard";

    const supabase = createClient();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push(redirect);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
            },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.signInWithOtp({
            phone: `+91${phone.replace(/\s/g, "")}`,
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setOtpSent(true);
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.verifyOtp({
            phone: `+91${phone.replace(/\s/g, "")}`,
            token: otp,
            type: "sms",
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push(redirect);
        }
    };

    return (
        <div
            className="bg-gradient-hero"
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
            }}
        >
            <button
                onClick={toggleTheme}
                className="theme-toggle"
                style={{ position: "fixed", top: 20, right: 20, zIndex: 50 }}
                aria-label="Toggle theme"
            >
                <div className="theme-toggle-knob">{theme === "dark" ? "🌙" : "☀️"}</div>
            </button>

            <div style={{ width: "100%", maxWidth: 420 }}>
                <a href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32, textDecoration: "none" }}>
                    <span style={{ fontSize: 32 }}>⚡</span>
                    <span className="text-gradient" style={{ fontSize: "1.6rem", fontWeight: 800 }}>LeadGen</span>
                </a>

                <div className="glass-card" style={{ padding: "36px 32px" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 800, textAlign: "center", marginBottom: 4 }}>Welcome Back</h1>
                    <p style={{ color: "var(--color-text-muted)", textAlign: "center", fontSize: "0.9rem", marginBottom: 28 }}>
                        Log in to your account
                    </p>

                    {error && (
                        <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: "0.85rem", color: "#FF6B6B" }}>
                            {error}
                        </div>
                    )}

                    {/* Google */}
                    <button onClick={handleGoogleLogin} disabled={loading} style={{ ...googleBtnStyle, opacity: loading ? 0.6 : 1 }}>
                        <svg width="18" height="18" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
                        <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>or</span>
                        <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
                    </div>

                    {/* Tabs */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--bg-surface-lighter)", borderRadius: 10, padding: 4 }}>
                        {["email", "phone"].map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMethod(m); setError(""); }}
                                style={{
                                    flex: 1, padding: "8px", borderRadius: 8, border: "none",
                                    background: method === m ? "var(--color-primary)" : "transparent",
                                    color: method === m ? "white" : "var(--color-text-muted)",
                                    fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease",
                                }}
                            >
                                {m === "email" ? "📧 Email" : "📱 Phone"}
                            </button>
                        ))}
                    </div>

                    {/* Email */}
                    {method === "email" && (
                        <form onSubmit={handleEmailLogin} style={{ display: "grid", gap: 14 }}>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Password</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} required />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "12px", opacity: loading ? 0.6 : 1 }}>
                                {loading ? "Logging in..." : "Log In"}
                            </button>
                        </form>
                    )}

                    {/* Phone */}
                    {method === "phone" && (
                        <form onSubmit={handleVerifyOTP} style={{ display: "grid", gap: 14 }}>
                            <div>
                                <label style={labelStyle}>Phone Number</label>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <span style={{ ...inputStyle, width: 60, textAlign: "center", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>+91</span>
                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" style={{ ...inputStyle, flex: 1 }} required />
                                </div>
                            </div>
                            {!otpSent ? (
                                <button type="button" className="btn-primary" disabled={loading} onClick={handleSendOTP} style={{ width: "100%", justifyContent: "center", padding: "12px", opacity: loading ? 0.6 : 1 }}>
                                    {loading ? "Sending..." : "Send OTP"}
                                </button>
                            ) : (
                                <>
                                    <div>
                                        <label style={labelStyle}>Enter OTP</label>
                                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" maxLength={6} style={{ ...inputStyle, textAlign: "center", letterSpacing: "0.3em", fontWeight: 700 }} required />
                                    </div>
                                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "12px", opacity: loading ? 0.6 : 1 }}>
                                        {loading ? "Verifying..." : "Verify & Log In"}
                                    </button>
                                </>
                            )}
                        </form>
                    )}
                </div>

                <p style={{ textAlign: "center", marginTop: 20, color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                    Don&apos;t have an account?{" "}
                    <a href="/signup" style={{ color: "var(--color-primary-light)", fontWeight: 600, textDecoration: "none" }}>Sign up free</a>
                </p>
            </div>
        </div>
    );
}

const googleBtnStyle = {
    width: "100%", padding: "12px", borderRadius: 12,
    border: "1px solid var(--color-border)", background: "var(--bg-surface-light)",
    color: "var(--color-text)", fontSize: "0.95rem", fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, transition: "all 0.2s ease", marginBottom: 20,
};
const labelStyle = { display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, color: "var(--color-text)" };
const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--bg-surface-lighter)", color: "var(--color-text)", fontSize: "0.9rem", outline: "none", transition: "border-color 0.2s ease" };
