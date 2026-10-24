"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import InputPanel from "@/components/InputPanel";
import ResultsDashboard from "@/components/ResultsDashboard";
import CommunityBoard from "@/components/CommunityBoard";
import HowItWorks from "@/components/HowItWorks";
import { VerificationResult } from "@/types";

type Page = "verify" | "community" | "howitworks";

export default function Home() {
  const [activePage, setActivePage] = useState<Page>("verify");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // BUG-08 fix: showHero is derived — no need for separate state
  const showHero = !result && !isLoading;

  const handleResult = (r: VerificationResult) => {
    setResult(r);
    // Scroll to results
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleReset = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGetStarted = () => {
    setTimeout(() => {
      document.getElementById("verify-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar activePage={activePage} onPageChange={(p) => { setActivePage(p); }} />

      <main style={{ flex: 1, maxWidth: 1200, width: "100%", margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        {activePage === "verify" && (
          <>
            {/* Hero shown when no result yet */}
            {showHero && !result && (
              <HeroSection onGetStarted={handleGetStarted} />
            )}

            {/* Verify section */}
            <div
              id="verify-section"
              style={{
                maxWidth: 860,
                margin: showHero && !result ? "0 auto" : "2rem auto 0",
                paddingTop: showHero && !result ? "0" : "1rem",
              }}
            >
              {/* Floating "Back to tips" breadcrumb when showing results */}
              {result && (
                <button
                  onClick={handleReset}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    background: "none",
                    border: "none",
                    color: "#9aa5c4",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    marginBottom: "1.5rem",
                    padding: "0.25rem 0",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f4ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9aa5c4")}
                >
                  ← Verify another posting
                </button>
              )}

              {/* Input Panel — hidden when result is shown or loading (BUG-01 fix) */}
              {!result && !isLoading && (
                <InputPanel
                  onResult={handleResult}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              )}

              {/* Loading state */}
              {isLoading && (
                <div
                  className="glass-card animate-fade-in"
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    marginTop: "1.5rem",
                  }}
                >
                  <div style={{ marginBottom: "1.5rem", position: "relative", display: "inline-block" }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle
                        cx="40" cy="40" r="32"
                        fill="none"
                        stroke="rgba(99, 102, 241, 0.15)"
                        strokeWidth="6"
                      />
                      <circle
                        cx="40" cy="40" r="32"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="60 140"
                        style={{
                          transformOrigin: "center",
                          transform: "rotate(-90deg)",
                          animation: "spin 1.2s linear infinite",
                        }}
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                      }}
                    >
                      🛡️
                    </div>
                  </div>
                  <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#f0f4ff", marginBottom: "0.5rem" }}>
                    Analysing with Gemini 2.5 Flash
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#9aa5c4" }}>
                    Advanced ML with Thinking mode — scanning for 30+ Indian scam patterns
                  </p>

                  {/* Animated analysis steps */}
                  <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left", maxWidth: 320, margin: "1.5rem auto 0" }}>
                    {[
                      "🧠 Gemini 2.5 Flash thinking...",
                      "🔍 Extracting keywords and patterns...",
                      "📧 Checking email domain legitimacy...",
                      "💰 Scanning for fee-related red flags...",
                      "🏢 Cross-referencing employer signals...",
                      "📊 Calculating Trust Score...",
                    ].map((step, i) => (
                      <div
                        key={step}
                        className="animate-fade-in"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.8125rem",
                          color: "#9aa5c4",
                          animationDelay: `${i * 0.4}s`,
                          opacity: 0,
                          animationFillMode: "forwards",
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#6366f1",
                            flexShrink: 0,
                            animation: "ping-dot 1s ease-in-out infinite",
                            animationDelay: `${i * 0.4}s`,
                          }}
                        />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {result && !isLoading && (
                <div id="results-section">
                  <ResultsDashboard result={result} onReset={handleReset} />
                </div>
              )}
            </div>
          </>
        )}

        {activePage === "community" && (
          <div style={{ paddingTop: "2rem" }}>
            <CommunityBoard />
          </div>
        )}

        {/* How It Works — shown when judges/users click the tab */}
        {activePage === "howitworks" && (
          <div style={{ paddingTop: "1rem" }}>
            <HowItWorks />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(99, 102, 241, 0.12)",
          padding: "2rem 1.5rem",
          textAlign: "center",
          color: "#5c6b8a",
          fontSize: "0.8125rem",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
            {[
              { label: "Cybercrime Helpline: 1930", href: "tel:1930" },
              { label: "cybercrime.gov.in", href: "https://cybercrime.gov.in" },
              { label: "MCA Portal", href: "https://www.mca.gov.in" },
              { label: "Sanchar Saathi", href: "https://sancharsaathi.gov.in" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#818cf8", textDecoration: "none", fontWeight: 500 }}
              >
                {link.label}
              </a>
            ))}
          </div>
          <p>
            © 2026 JobShield AI · Built to protect college students &amp; fresh graduates from employment fraud in India.
            <br />
            <span style={{ fontSize: "0.75rem" }}>
              ⚠️ AI analysis is indicative. Always independently verify before making decisions. Never pay to get a job.
            </span>
          </p>
        </div>
      </footer>

      {/* BUG-02 fix: @keyframes spin moved to globals.css — no inline style needed */}
    </div>
  );
}
