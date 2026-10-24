"use client";

// HowItWorks.tsx
// This component is shown when judges/users click "How It Works" in the navbar.
// It explains the project in plain English with a visual step-by-step flow.

import { Shield, Zap, Brain, FileText, Users } from "lucide-react";

export default function HowItWorks() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingTop: "1.5rem" }}
    >
      {/* ── Page Header ── */}
      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 900,
            background: "linear-gradient(135deg, #f0f4ff, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.03em",
            marginBottom: "0.75rem",
          }}
        >
          🧠 How JobShield AI Works
        </h1>
        <p style={{ color: "#9aa5c4", fontSize: "1rem", maxWidth: 600, margin: "0 auto" }}>
          A simple explanation of the technology behind the scam detector — built for
          college students, explained for everyone.
        </p>
      </div>

      {/* ── The Problem ── */}
      <div className="glass-card" style={{ padding: "1.75rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#f0f4ff", marginBottom: "1rem" }}>
          😟 The Problem We&apos;re Solving
        </h2>
        <p style={{ color: "#9aa5c4", lineHeight: 1.7, fontSize: "0.9375rem" }}>
          Every day, thousands of students in India receive fake job offers on WhatsApp, Instagram, and
          pamphlets — promising high salaries but asking for a{" "}
          <span style={{ color: "#ef4444", fontWeight: 600 }}>&quot;registration fee&quot;</span> or
          &quot;refundable deposit&quot; first. Most people can&apos;t tell if it&apos;s real.
          JobShield AI can — in under 5 seconds.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginTop: "1.25rem",
          }}
        >
          {[
            { emoji: "📱", text: "Fake job on WhatsApp" },
            { emoji: "💸", text: "Asks for registration fee" },
            { emoji: "😰", text: "Student pays and loses money" },
            { emoji: "🛡️", text: "JobShield catches it first" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "1rem",
                background: i === 3 ? "rgba(16,185,129,0.08)" : "rgba(22,29,48,0.8)",
                borderRadius: 10,
                border: i === 3 ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(99,102,241,0.1)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{item.emoji}</div>
              <p style={{ fontSize: "0.8125rem", color: i === 3 ? "#10b981" : "#9aa5c4", fontWeight: 500 }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Step-by-Step Flow ── */}
      <div className="glass-card" style={{ padding: "1.75rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#f0f4ff", marginBottom: "1.5rem" }}>
          🔄 Step-by-Step: What Happens When You Click &quot;Verify&quot;
        </h2>

        {/* Steps */}
        {[
          {
            step: "1",
            icon: "📝",
            title: "You paste the job message",
            desc: "You can paste text (WhatsApp message, email), enter a URL (job portal link), or upload a screenshot/pamphlet image.",
            color: "#6366f1",
          },
          {
            step: "2",
            icon: "🌐",
            title: "Our server receives it",
            desc: "The Next.js API route at /api/verify gets your input. If it's a URL, the server fetches and reads the webpage. If it's an image, it sends it to Gemini's Vision model to extract the text first (OCR).",
            color: "#06b6d4",
          },
          {
            step: "3",
            icon: "🧠",
            title: "Gemini 2.5 Flash analyses it (The ML Model)",
            desc: "We send the text to Google's Gemini 2.5 Flash AI model. We also give it a 'System Prompt' — think of it like a detailed job description that teaches the AI what makes a job scam. Gemini 2.5 Flash uses 'Thinking Mode': it reasons through the evidence step by step (like a detective) before giving a verdict.",
            color: "#818cf8",
            highlight: true,
          },
          {
            step: "4",
            icon: "📊",
            title: "AI returns a structured result",
            desc: "Gemini returns a JSON object with: Trust Score (0–100), Verdict, list of Red Flags it found, Positive Signals, and Recommendations. We validate this with a 'Zod schema' to make sure the AI always returns the right format.",
            color: "#f59e0b",
          },
          {
            step: "5",
            icon: "✅",
            title: "Results shown on screen",
            desc: "The frontend displays the animated Trust Score ring, verdict badge, red flags list, and safe action steps. You can also download a PDF report or share the result.",
            color: "#10b981",
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "1.25rem",
              marginBottom: i < 4 ? "1.25rem" : 0,
              padding: "1.25rem",
              background: item.highlight ? "rgba(99,102,241,0.07)" : "rgba(22,29,48,0.5)",
              borderRadius: 12,
              border: item.highlight ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(99,102,241,0.08)",
              position: "relative",
            }}
          >
            {/* Step number */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: `${item.color}22`,
                border: `2px solid ${item.color}55`,
                color: item.color,
                fontWeight: 800,
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {item.step}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: "#f0f4ff", marginBottom: "0.375rem", fontSize: "0.9375rem" }}>
                {item.icon} {item.title}
                {item.highlight && (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      fontSize: "0.7rem",
                      padding: "0.1rem 0.5rem",
                      background: "rgba(99,102,241,0.2)",
                      border: "1px solid rgba(99,102,241,0.4)",
                      borderRadius: 99,
                      color: "#818cf8",
                      fontWeight: 700,
                    }}
                  >
                    ML Model
                  </span>
                )}
              </p>
              <p style={{ color: "#9aa5c4", fontSize: "0.875rem", lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── The AI Model Explained ── */}
      <div className="glass-card" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <Brain size={20} color="#818cf8" />
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#f0f4ff" }}>
            The ML Model — Gemini 2.5 Flash Explained Simply
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {[
            {
              icon: "💬",
              title: "System Prompt = AI's Training Instructions",
              desc: "We wrote a detailed instruction (called a System Prompt) that teaches Gemini what makes a job scam. It lists 30+ red flags specific to India — things like 'registration fee', fake TCS/Infosys emails, WhatsApp-only interviews, etc.",
              color: "#6366f1",
            },
            {
              icon: "🤔",
              title: "Thinking Mode = Internal Reasoning",
              desc: "Gemini 2.5 Flash has a special 'Thinking Mode'. Before answering, it reasons through the evidence step-by-step internally (like a detective). This makes it much harder to fool with mixed signals.",
              color: "#818cf8",
            },
            {
              icon: "📋",
              title: "Structured Output = Reliable Results",
              desc: "Instead of free text, we ask Gemini to return a fixed JSON format. We then validate it with Zod to guarantee the Trust Score, Verdict, and Red Flags are always in the right shape.",
              color: "#06b6d4",
            },
            {
              icon: "🔄",
              title: "Fallback = Always Works",
              desc: "If the API key isn't set or Gemini fails, the app automatically uses a built-in keyword-matching engine (mockEngine.ts) so the app never breaks during a demo.",
              color: "#10b981",
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                padding: "1.25rem",
                background: "rgba(22,29,48,0.7)",
                borderRadius: 12,
                border: `1px solid ${card.color}22`,
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.625rem" }}>{card.icon}</div>
              <p style={{ fontWeight: 700, color: "#f0f4ff", marginBottom: "0.375rem", fontSize: "0.875rem" }}>
                {card.title}
              </p>
              <p style={{ color: "#9aa5c4", fontSize: "0.8125rem", lineHeight: 1.6 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tech Stack ── */}
      <div className="glass-card" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <Zap size={18} color="#f59e0b" />
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#f0f4ff" }}>
            Tech Stack — What We Used and Why
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {[
            { tech: "Next.js 15", why: "React framework that lets us build the frontend (pages, components) AND backend (API routes) in one project — no separate server needed", emoji: "⚛️" },
            { tech: "TypeScript", why: "JavaScript with type checking — helps catch bugs early. When you say a variable is a number, TypeScript won't let you accidentally assign text to it", emoji: "🔷" },
            { tech: "Google Gemini 2.5 Flash", why: "Google's latest AI model — faster than GPT-4, multimodal (text + images), free tier available, and has Thinking Mode for deeper reasoning", emoji: "🧠" },
            { tech: "Zod", why: "Schema validation library — ensures the AI always returns the exact JSON shape we expect, so the app never crashes from an unexpected AI response", emoji: "✅" },
            { tech: "jsPDF", why: "Generates the downloadable PDF report directly in the browser — no server needed for PDF creation", emoji: "📄" },
            { tech: "Vanilla CSS", why: "We wrote all styles ourselves (no Tailwind/Bootstrap) — gives full control over the dark glassmorphism design and custom animations", emoji: "🎨" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
                padding: "0.875rem 1rem",
                background: "rgba(22,29,48,0.6)",
                borderRadius: 10,
                border: "1px solid rgba(99,102,241,0.1)",
              }}
            >
              <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>{item.emoji}</span>
              <div>
                <span style={{ fontWeight: 700, color: "#818cf8", fontSize: "0.875rem" }}>{item.tech} — </span>
                <span style={{ color: "#9aa5c4", fontSize: "0.875rem", lineHeight: 1.55 }}>{item.why}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Community Board ── */}
      <div className="glass-card" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <Users size={18} color="#10b981" />
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#f0f4ff" }}>
            Community Scam Board — Crowd-Sourced Protection
          </h2>
        </div>
        <p style={{ color: "#9aa5c4", fontSize: "0.9375rem", lineHeight: 1.7 }}>
          Beyond AI analysis, users can <strong style={{ color: "#f0f4ff" }}>report scams they&apos;ve encountered</strong> to the community board.
          Other users can upvote reports to surface the most dangerous ones. This creates a <strong style={{ color: "#f0f4ff" }}>crowd-sourced scam database</strong> specific to Indian cities and job categories.
          Reports are stored in-session on the server (no database needed for the demo).
        </p>
      </div>

      {/* ── File Map ── */}
      <div className="glass-card" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <FileText size={18} color="#06b6d4" />
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#f0f4ff" }}>
            Where Is Everything? (File Map)
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            { file: "src/app/api/verify/route.ts", desc: "🧠 THE BRAIN — Gemini 2.5 Flash is called here. The system prompt lives here too.", highlight: true },
            { file: "src/app/page.tsx", desc: "Main page — controls which section is shown (hero / input / results)", highlight: false },
            { file: "src/components/InputPanel.tsx", desc: "The form where users paste text, enter URL, or upload image", highlight: false },
            { file: "src/components/ResultsDashboard.tsx", desc: "Shows the trust score ring, red flags, and recommendations", highlight: false },
            { file: "src/components/TrustScoreMeter.tsx", desc: "The animated circular trust score graphic", highlight: false },
            { file: "src/components/CommunityBoard.tsx", desc: "The community scam reports page with filters and upvoting", highlight: false },
            { file: "src/lib/mockEngine.ts", desc: "Fallback keyword-matching engine used when Gemini is unavailable", highlight: false },
            { file: "src/app/globals.css", desc: "All styles — dark theme, glass cards, animations, responsive breakpoints", highlight: false },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                background: item.highlight ? "rgba(99,102,241,0.1)" : "rgba(22,29,48,0.5)",
                borderRadius: 8,
                border: item.highlight ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(99,102,241,0.08)",
                alignItems: "flex-start",
              }}
            >
              <code
                style={{
                  fontSize: "0.75rem",
                  color: item.highlight ? "#818cf8" : "#5c6b8a",
                  fontFamily: "monospace",
                  flexShrink: 0,
                  paddingTop: "1px",
                  minWidth: 260,
                  wordBreak: "break-all",
                }}
              >
                {item.file}
              </code>
              <span style={{ fontSize: "0.8125rem", color: "#9aa5c4" }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Shield badge ── */}
      <div
        className="glass-card"
        style={{
          padding: "1.5rem",
          textAlign: "center",
          background: "rgba(16,185,129,0.05)",
          borderColor: "rgba(16,185,129,0.2)",
        }}
      >
        <Shield size={32} color="#10b981" style={{ margin: "0 auto 0.75rem" }} />
        <p style={{ fontWeight: 700, color: "#f0f4ff", marginBottom: "0.375rem" }}>
          Built to protect the next generation of Indian professionals.
        </p>
        <p style={{ color: "#9aa5c4", fontSize: "0.875rem" }}>
          Free · No login · No data stored · Works on any device
        </p>
      </div>
    </div>
  );
}
