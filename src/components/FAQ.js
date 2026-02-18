"use client";
import { useState } from "react";

const faqs = [
    {
        q: "Is this really free?",
        a: "Yes! The free plan lets you scrape Google Maps with basic fields forever. No credit card required. You only pay if you want multi-platform scraping, all data fields, and premium features.",
    },
    {
        q: "Why does the browser open on my computer?",
        a: "This is by design! Running the browser locally means: (1) zero cloud costs for us (savings passed to you), (2) you can watch scraping happen in real-time, and (3) scraping from your own IP is more natural and avoids bot detection.",
    },
    {
        q: "Is web scraping legal in India?",
        a: "Scraping publicly available business information (names, phone numbers, addresses) from Google Maps and business directories is generally considered legal. Our tool only collects publicly visible data. However, we recommend consulting a legal advisor for your specific use case.",
    },
    {
        q: "Will my IP get blocked?",
        a: "Our agent includes smart delays and human-like browsing patterns to minimize detection. Since you're scraping from your own IP with a real browser, it looks like normal browsing activity.",
    },
    {
        q: "How many leads can I scrape?",
        a: "Free users can store up to 500 leads. Pro users get unlimited storage. The number of leads per scrape depends on how many businesses exist for your search — Google Maps typically shows 60-200 results per category per city.",
    },
    {
        q: "Can I cancel my subscription anytime?",
        a: "Absolutely. Cancel anytime from your dashboard. Your data stays accessible on the free plan afterward.",
    },
    {
        q: "What platforms are coming next?",
        a: "Instagram and LinkedIn are next on the roadmap. We're also considering Facebook Pages, Sulekha, and TradeIndia. Pro users get early access to new platforms.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section
            id="faq"
            className="bg-gradient-section"
            style={{ padding: "100px 24px" }}
        >
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 60 }}>
                    <h2
                        style={{
                            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                            marginBottom: 16,
                        }}
                    >
                        Frequently Asked{" "}
                        <span className="text-gradient">Questions</span>
                    </h2>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="glass-card"
                            style={{
                                padding: 0,
                                overflow: "hidden",
                                cursor: "pointer",
                                transform: "none",
                            }}
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        >
                            <div
                                style={{
                                    padding: "18px 24px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: "0.95rem",
                                        fontWeight: 600,
                                        paddingRight: 16,
                                    }}
                                >
                                    {faq.q}
                                </h3>
                                <span
                                    style={{
                                        fontSize: "1.2rem",
                                        flexShrink: 0,
                                        transition: "transform 0.3s ease",
                                        transform: openIndex === i ? "rotate(45deg)" : "rotate(0)",
                                        color: "var(--color-primary-light)",
                                    }}
                                >
                                    +
                                </span>
                            </div>
                            <div
                                style={{
                                    maxHeight: openIndex === i ? 300 : 0,
                                    overflow: "hidden",
                                    transition: "max-height 0.3s ease",
                                }}
                            >
                                <p
                                    style={{
                                        padding: "0 24px 18px",
                                        color: "var(--color-text-muted)",
                                        fontSize: "0.9rem",
                                        lineHeight: 1.7,
                                    }}
                                >
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
