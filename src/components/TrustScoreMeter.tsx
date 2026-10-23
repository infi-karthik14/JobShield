"use client";

import { useEffect, useRef } from "react";
import { VerificationResult } from "@/types";

interface TrustScoreMeterProps {
  result: VerificationResult;
}

export default function TrustScoreMeter({ result }: TrustScoreMeterProps) {
  const { trustScore, verdict } = result;

  const color =
    verdict === "Verified Legit"
      ? "#10b981"
      : verdict === "Needs Verification"
      ? "#f59e0b"
      : "#ef4444";

  const bgColor =
    verdict === "Verified Legit"
      ? "rgba(16, 185, 129, 0.12)"
      : verdict === "Needs Verification"
      ? "rgba(245, 158, 11, 0.12)"
      : "rgba(239, 68, 68, 0.12)";

  const emoji =
    verdict === "Verified Legit" ? "✅" : verdict === "Needs Verification" ? "⚠️" : "🚨";

  // SVG circle params
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (trustScore / 100) * circumference;

  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!circleRef.current) return;
    // Animate from full offset to target
    const el = circleRef.current;
    el.style.strokeDashoffset = String(circumference);
    el.style.transition = "none";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
        el.style.strokeDashoffset = String(targetOffset);
      });
    });
  }, [trustScore, targetOffset, circumference]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
      }}
    >
      {/* SVG Ring */}
      <div style={{ position: "relative" }}>
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Background ring */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="12"
          />

          {/* Animated progress ring */}
          <circle
            ref={circleRef}
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{
              transformOrigin: "center",
              transform: "rotate(-90deg)",
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
            className="score-ring"
          />

          {/* Center content */}
          <foreignObject x="30" y="30" width="120" height="120">
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
              }}
            >
              <div
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 900,
                  color,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {trustScore}
              </div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Trust Score
              </div>
            </div>
          </foreignObject>
        </svg>

        {/* Glow pulse behind ring */}
        <div
          style={{
            position: "absolute",
            inset: "20px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
            animation: "float 3s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Verdict Badge */}
      <div
        style={{
          padding: "0.75rem 1.5rem",
          borderRadius: 99,
          background: bgColor,
          border: `1.5px solid ${color}55`,
          color,
          fontWeight: 700,
          fontSize: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          letterSpacing: "-0.01em",
          boxShadow: `0 0 20px ${color}22`,
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>{emoji}</span>
        {verdict}
      </div>

      {/* Score bar */}
      <div style={{ width: "100%", maxWidth: 240 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.6875rem",
            color: "#5c6b8a",
            marginBottom: "0.375rem",
            fontWeight: 500,
          }}
        >
          <span>Scam Risk</span>
          <span>Legit</span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 99,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${trustScore}%`,
              borderRadius: 99,
              background: `linear-gradient(90deg, #ef4444, #f59e0b 50%, #10b981)`,
              backgroundSize: "240px 100%",
              backgroundPosition: `${100 - trustScore}% 0`,
              transition: "width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
