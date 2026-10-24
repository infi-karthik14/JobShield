"use client";

import { Shield, Zap, Users, TrendingUp } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const STATS = [
  { icon: "🛡️", value: "10K+", label: "Scams Detected" },
  { icon: "👥", value: "50K+", label: "Students Protected" },
  { icon: "⚡", value: "< 5s", label: "Analysis Time" },
  { icon: "📍", value: "UP & Beyond", label: "Coverage Area" },
];

const FEATURES = [
  {
    icon: "🔍",
    title: "Multi-Modal Analysis",
    desc: "Paste text, enter URL, or upload screenshots — we analyze anything",
    color: "#6366f1",
  },
  {
    icon: "🧠",
    title: "Gemini 2.5 Flash + Thinking",
    desc: "Google’s latest ML model reasons step-by-step (like a detective) before giving a verdict — 30+ India-specific scam patterns",
    color: "#06b6d4",
  },
  {
    icon: "🚨",
    title: "Red Flag Extraction",
    desc: "Instantly highlights payment demands, fake domains, and deceptive tactics",
    color: "#ef4444",
  },
  {
    icon: "📋",
    title: "PDF Safety Report",
    desc: "Download a clean report to share with friends, family, or authorities",
    color: "#10b981",
  },
  {
    icon: "👥",
    title: "Community Scam Board",
    desc: "Crowd-sourced database of reported job scams in your area",
    color: "#f59e0b",
  },
  {
    icon: "🆘",
    title: "Safe Action Guidance",
    desc: "Actionable steps with direct links to cybercrime helplines and MCA portal",
    color: "#8b5cf6",
  },
];

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 1.5rem 2rem" }}>
      {/* Badge */}
      <div
        className="animate-fade-in-up"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.4rem 1.125rem",
          borderRadius: 99,
          background: "rgba(99, 102, 241, 0.1)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          color: "#818cf8",
          fontSize: "0.8125rem",
          fontWeight: 600,
          marginBottom: "1.75rem",
          letterSpacing: "0.02em",
        }}
      >
        <Zap size={14} fill="#818cf8" />
        Powered by Gemini 2.5 Flash · Thinking Mode · Free · No signup
      </div>

      {/* Headline */}
      <h1
        className="animate-fade-in-up delay-100"
        style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          marginBottom: "1.25rem",
          maxWidth: 860,
          margin: "0 auto 1.25rem",
        }}
      >
        <span
          style={{
            background: "linear-gradient(135deg, #f0f4ff 0%, #c7d2fe 50%, #818cf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Don&apos;t Get Scammed.
        </span>
        <br />
        <span
          style={{
            background: "linear-gradient(135deg, #f0f4ff, #e2e8f0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Verify Before You Apply.
        </span>
      </h1>

      {/* Subheadline */}
      <p
        className="animate-fade-in-up delay-200"
        style={{
          fontSize: "clamp(1rem, 2vw, 1.1875rem)",
          color: "#9aa5c4",
          maxWidth: 640,
          margin: "0 auto 2.5rem",
          lineHeight: 1.7,
        }}
      >
        JobShield AI detects employment fraud, fake registration fees, and deceptive
        recruitment tactics in{" "}
        <span style={{ color: "#f0f4ff", fontWeight: 600 }}>
          WhatsApp forwards, job portals, and walk-in circulars
        </span>
        . Built for college students &amp; local job seekers in India.
      </p>

      {/* CTA Buttons */}
      <div
        className="animate-fade-in-up delay-300"
        style={{
          display: "flex",
          gap: "0.875rem",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "3.5rem",
        }}
      >
        <button
          onClick={onGetStarted}
          className="btn-primary"
          id="hero-cta-btn"
          style={{
            padding: "0.9375rem 2rem",
            fontSize: "1.0625rem",
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
          }}
        >
          <Shield size={20} />
          Verify a Job Posting Now
        </button>

        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.9375rem 1.5rem",
            borderRadius: 10,
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
            fontSize: "0.9375rem",
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          🆘 Helpline: 1930
        </a>
      </div>

      {/* Stats */}
      <div
        className="animate-fade-in-up delay-400"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2.5rem",
          flexWrap: "wrap",
          marginBottom: "4rem",
          padding: "1.5rem 2rem",
          background: "rgba(22, 29, 48, 0.5)",
          borderRadius: 16,
          border: "1px solid rgba(99, 102, 241, 0.12)",
          maxWidth: 700,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {STATS.map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{stat.icon}</div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#f0f4ff",
                letterSpacing: "-0.02em",
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#5c6b8a", fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div
        className="animate-fade-in-up delay-500"
        style={{ maxWidth: 900, margin: "0 auto" }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#5c6b8a",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          Why JobShield AI?
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
            textAlign: "left",
          }}
        >
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card"
              style={{
                padding: "1.25rem",
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
                animationDelay: `${0.5 + i * 0.08}s`,
                transition: "transform 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: `${feature.color}18`,
                  border: `1px solid ${feature.color}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  flexShrink: 0,
                }}
              >
                {feature.icon}
              </div>
              <div>
                <p style={{ fontWeight: 700, color: "#f0f4ff", marginBottom: "0.25rem", fontSize: "0.9375rem" }}>
                  {feature.title}
                </p>
                <p style={{ fontSize: "0.8125rem", color: "#9aa5c4", lineHeight: 1.5 }}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
