"use client";

import { useCallback, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  BookOpen,
  Download,
  Share2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { VerificationResult } from "@/types";
import TrustScoreMeter from "./TrustScoreMeter";

interface ResultsDashboardProps {
  result: VerificationResult;
  onReset: () => void;
}

export default function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  const { verdict, redFlags, positiveSignals, recommendations, employerChecks, summary, analysedAt } = result;
  const [copied, setCopied] = useState(false);

  const verdictColor =
    verdict === "Verified Legit"
      ? "#10b981"
      : verdict === "Needs Verification"
      ? "#f59e0b"
      : "#ef4444";

  const handleDownloadPDF = useCallback(async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = margin;

      // Header
      doc.setFillColor(15, 20, 52);
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(99, 102, 241);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("JobShield AI", margin, 18);
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text("Job Scam Verification Report", margin, 28);
      doc.text(`Generated: ${new Date(analysedAt || Date.now()).toLocaleString("en-IN")}`, margin, 36);

      y = 55;

      // Trust Score
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Trust Score: ${result.trustScore}% — ${verdict}`, margin, y);
      y += 10;

      // Summary
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const summaryLines = doc.splitTextToSize(`Summary: ${summary}`, pageWidth - 2 * margin);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 6 + 10;

      // Red Flags
      if (redFlags.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(239, 68, 68);
        doc.text(`🚨 Red Flags (${redFlags.length})`, margin, y);
        y += 8;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        for (const flag of redFlags) {
          const lines = doc.splitTextToSize(`• ${flag}`, pageWidth - 2 * margin);
          doc.text(lines, margin, y);
          y += lines.length * 5.5 + 3;
          if (y > 270) { doc.addPage(); y = 20; }
        }
        y += 5;
      }

      // Positive Signals
      if (positiveSignals.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129);
        doc.text(`✅ Positive Signals`, margin, y);
        y += 8;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        for (const signal of positiveSignals) {
          const lines = doc.splitTextToSize(`• ${signal}`, pageWidth - 2 * margin);
          doc.text(lines, margin, y);
          y += lines.length * 5.5 + 3;
          if (y > 270) { doc.addPage(); y = 20; }
        }
        y += 5;
      }

      // Recommendations
      if (recommendations.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(99, 102, 241);
        doc.text(`📋 Recommendations`, margin, y);
        y += 8;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        for (const rec of recommendations) {
          const lines = doc.splitTextToSize(`• ${rec}`, pageWidth - 2 * margin);
          doc.text(lines, margin, y);
          y += lines.length * 5.5 + 3;
          if (y > 270) { doc.addPage(); y = 20; }
        }
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(
          "JobShield AI | jobshield.ai | Report to Cybercrime: cybercrime.gov.in | Helpline: 1930",
          margin,
          doc.internal.pageSize.getHeight() - 10
        );
      }

      doc.save(`JobShield-Report-${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      window.print();
    }
  }, [result, summary, redFlags, positiveSignals, recommendations, analysedAt, verdict]);

  const statusIcon = (status: string) => {
    if (status === "pass") return <CheckCircle size={14} color="#10b981" />;
    if (status === "fail") return <AlertTriangle size={14} color="#ef4444" />;
    if (status === "warn") return <Info size={14} color="#f59e0b" />;
    return <HelpCircle size={14} color="#5c6b8a" />;
  };

  const statusColor = (status: string) => {
    if (status === "pass") return "#10b981";
    if (status === "fail") return "#ef4444";
    if (status === "warn") return "#f59e0b";
    return "#5c6b8a";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {verdict === "Verified Legit" ? (
            <ShieldCheck size={20} color="#10b981" />
          ) : verdict === "High Risk / Likely Scam" ? (
            <ShieldAlert size={20} color="#ef4444" />
          ) : (
            <HelpCircle size={20} color="#f59e0b" />
          )}
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f0f4ff" }}>
            Verification Result
          </h2>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            onClick={handleDownloadPDF}
            id="download-pdf-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "#818cf8",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Download size={14} />
            PDF Report
          </button>
          <button
            id="share-result-btn"
            onClick={async () => {
              const text = [
                `🛡️ JobShield AI Result`,
                `Trust Score: ${result.trustScore}% — ${verdict}`,
                ``,
                `📋 Summary: ${summary}`,
                ``,
                redFlags.length > 0 ? `🚨 Red Flags:\n${redFlags.map(f => `  • ${f}`).join("\n")}` : "",
                ``,
                `📌 Report scams: cybercrime.gov.in | Helpline: 1930`,
              ].filter(Boolean).join("\n");
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                // fallback
                const ta = document.createElement("textarea");
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              background: copied ? "rgba(16, 185, 129, 0.1)" : "rgba(6, 182, 212, 0.1)",
              border: `1px solid ${copied ? "rgba(16,185,129,0.4)" : "rgba(6,182,212,0.3)"}`,
              color: copied ? "#10b981" : "#22d3ee",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Share2 size={14} />
            {copied ? "Copied!" : "Share"}
          </button>
          <button
            onClick={onReset}
            id="verify-another-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#9aa5c4",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <RefreshCw size={14} />
            Verify Another
          </button>
        </div>
      </div>

      {/* Score + Summary */}
      <div
        className="glass-card animate-fade-in-up"
        style={{ padding: "1.75rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "2rem",
            alignItems: "center",
          }}
          className="score-grid"
        >
          <TrustScoreMeter result={result} />

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#5c6b8a",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.5rem",
                }}
              >
                AI Analysis Summary
              </p>
              <p
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: 1.65,
                  color: "#c8d2e8",
                }}
              >
                {summary}
              </p>
            </div>

            {result.inputPreview && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(22, 29, 48, 0.8)",
                  borderRadius: 8,
                  borderLeft: `3px solid ${verdictColor}`,
                }}
              >
                <p style={{ fontSize: "0.75rem", color: "#5c6b8a", marginBottom: "0.25rem", fontWeight: 600 }}>
                  ANALYSED INPUT PREVIEW
                </p>
                <p style={{ fontSize: "0.8125rem", color: "#9aa5c4", lineHeight: 1.5 }}>
                  {result.inputPreview}{result.inputPreview.length === 120 ? "..." : ""}
                </p>
              </div>
            )}

            {analysedAt && (
              <p style={{ fontSize: "0.75rem", color: "#5c6b8a" }}>
                Analysed at {new Date(analysedAt).toLocaleString("en-IN")} · {result.inputType?.toUpperCase()} input
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Two column: Red Flags + Positive Signals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="flags-grid">
        {/* Red Flags */}
        <div
          className="glass-card animate-fade-in-up delay-100"
          style={{ padding: "1.5rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <AlertTriangle size={17} color="#ef4444" />
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#f0f4ff" }}>
              Red Flags
            </h3>
            <span
              style={{
                marginLeft: "auto",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#ef4444",
                borderRadius: 99,
                padding: "0.15rem 0.6rem",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {redFlags.length}
            </span>
          </div>
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.625rem", listStyle: "none" }}>
            {redFlags.map((flag, i) => (
              <li
                key={i}
                className="animate-fade-in"
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  padding: "0.625rem",
                  background: "rgba(239, 68, 68, 0.06)",
                  borderRadius: 8,
                  border: "1px solid rgba(239, 68, 68, 0.12)",
                  animationDelay: `${i * 0.08}s`,
                  opacity: 0,
                  animationFillMode: "forwards",
                }}
              >
                <span style={{ flexShrink: 0, marginTop: "2px", fontSize: "0.875rem" }}>🚨</span>
                <span style={{ fontSize: "0.8125rem", color: "#e2a0a0", lineHeight: 1.5 }}>{flag}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Positive Signals */}
        <div
          className="glass-card animate-fade-in-up delay-200"
          style={{ padding: "1.5rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <CheckCircle size={17} color="#10b981" />
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#f0f4ff" }}>
              Positive Signals
            </h3>
            <span
              style={{
                marginLeft: "auto",
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
                borderRadius: 99,
                padding: "0.15rem 0.6rem",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {positiveSignals.length}
            </span>
          </div>
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.625rem", listStyle: "none" }}>
            {positiveSignals.map((signal, i) => (
              <li
                key={i}
                className="animate-fade-in"
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  padding: "0.625rem",
                  background: "rgba(16, 185, 129, 0.06)",
                  borderRadius: 8,
                  border: "1px solid rgba(16, 185, 129, 0.12)",
                  animationDelay: `${i * 0.08}s`,
                  opacity: 0,
                  animationFillMode: "forwards",
                }}
              >
                <span style={{ flexShrink: 0, marginTop: "2px", fontSize: "0.875rem" }}>✅</span>
                <span style={{ fontSize: "0.8125rem", color: "#86e8c9", lineHeight: 1.5 }}>{signal}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Employer Legitimacy Checklist */}
      {employerChecks && employerChecks.length > 0 && (
        <div
          className="glass-card animate-fade-in-up delay-300"
          style={{ padding: "1.5rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <BookOpen size={17} color="#818cf8" />
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#f0f4ff" }}>
              Employer Legitimacy Checklist
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem" }}>
            {employerChecks.map((check, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.625rem",
                  padding: "0.875rem",
                  background: "rgba(22, 29, 48, 0.8)",
                  borderRadius: 10,
                  border: `1px solid ${statusColor(check.status)}22`,
                }}
              >
                <span style={{ flexShrink: 0, marginTop: "1px" }}>{statusIcon(check.status)}</span>
                <div>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: statusColor(check.status),
                      marginBottom: "0.25rem",
                    }}
                  >
                    {check.label}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#9aa5c4", lineHeight: 1.4 }}>{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div
        className="glass-card animate-fade-in-up delay-400"
        style={{
          padding: "1.5rem",
          background: "rgba(99, 102, 241, 0.06)",
          borderColor: "rgba(99, 102, 241, 0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.1rem" }}>📋</span>
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#f0f4ff" }}>
            Safe Action Guidance
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {recommendations.map((rec, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
                padding: "0.75rem 1rem",
                background: "rgba(22, 29, 48, 0.6)",
                borderRadius: 10,
                border: "1px solid rgba(99, 102, 241, 0.12)",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 99,
                  background: "rgba(99, 102, 241, 0.2)",
                  color: "#818cf8",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                {i + 1}
              </div>
              <p style={{ fontSize: "0.875rem", color: "#c8d2e8", lineHeight: 1.55, flex: 1 }}>{rec}</p>
            </div>
          ))}
        </div>

        {/* Emergency Links */}
        <div
          style={{
            marginTop: "1.25rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(99, 102, 241, 0.15)",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.625rem",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "#5c6b8a", fontWeight: 600, alignSelf: "center" }}>
            Quick Links:
          </span>
          {[
            { label: "Report Cybercrime (1930)", href: "https://cybercrime.gov.in" },
            { label: "MCA Company Search", href: "https://www.mca.gov.in/content/mca/global/en/data-and-reports/data-and-reports-index.html" },
            { label: "Sanchar Saathi", href: "https://sancharsaathi.gov.in" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#818cf8",
                padding: "0.375rem 0.75rem",
                borderRadius: 8,
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              {link.label}
              <ExternalLink size={11} />
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .score-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .flags-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
