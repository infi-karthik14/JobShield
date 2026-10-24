"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  ThumbsUp,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { CommunityReport } from "@/types";

const CATEGORIES = [
  "all", "IT / Software", "BPO / Call Centre", "Work From Home",
  "Logistics / Warehouse", "E-commerce / Retail", "Government / PSU",
  "Digital Marketing", "Finance / Banking",
];

const VERDICTS = ["all", "High Risk / Likely Scam", "Needs Verification", "Verified Legit"];

export default function CommunityBoard() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [verdict, setVerdict] = useState("all");
  const [showReportForm, setShowReportForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(() => {
    // Restore from localStorage so upvotes survive page refresh
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("jobshield_upvotes");
        return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
      } catch {
        return new Set<string>();
      }
    }
    return new Set<string>();
  });
  // BUG-10 fix: track total (unfiltered) report count separately from filtered results
  const [totalReports, setTotalReports] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "BPO / Call Centre",
    contactInfo: "",
    verdict: "High Risk / Likely Scam",
    tags: "",
  });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "all") params.set("category", category);
      if (verdict !== "all") params.set("verdict", verdict);

      const res = await fetch(`/api/community-reports?${params}`);
      const data = await res.json();
      setReports(data.reports);

      // BUG-10 fix: fetch unfiltered total when no filters are active
      if (!search && category === "all" && verdict === "all") {
        setTotalReports(data.total ?? data.reports.length);
      }
    } catch {
      console.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  }, [search, category, verdict]);

  useEffect(() => {
    const debounce = setTimeout(fetchReports, 300);
    return () => clearTimeout(debounce);
  }, [fetchReports]);

  const handleUpvote = async (id: string) => {
    if (upvotedIds.has(id)) return;
    const nextSet = new Set([...upvotedIds, id]);
    setUpvotedIds(nextSet);
    // Persist to localStorage
    try {
      localStorage.setItem("jobshield_upvotes", JSON.stringify([...nextSet]));
    } catch { /* storage full or unavailable */ }
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
    await fetch("/api/community-reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/community-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      // BUG-05 fix: check res.ok and display server error to the user
      if (!res.ok) {
        const err = await res.json();
        setSubmitError(err.error || "Failed to submit report. Please try again.");
        return;
      }
      setSubmitSuccess(true);
      setFormData({
        title: "", description: "", location: "",
        category: "BPO / Call Centre", contactInfo: "",
        verdict: "High Risk / Likely Scam", tags: "",
      });
      setTimeout(() => {
        setShowReportForm(false);
        setSubmitSuccess(false);
        fetchReports();
      }, 2000);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const verdictConfig = {
    "High Risk / Likely Scam": { color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: AlertTriangle, emoji: "🚨" },
    "Needs Verification": { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: HelpCircle, emoji: "⚠️" },
    "Verified Legit": { color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle, emoji: "✅" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #f0f4ff, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
              marginBottom: "0.375rem",
            }}
          >
            🚨 Community Scam Board
          </h1>
          <p style={{ color: "#9aa5c4", fontSize: "0.9375rem" }}>
            Crowd-sourced reports of job scams in your area. Help others stay safe.
          </p>
        </div>
        <button
          onClick={() => setShowReportForm(true)}
          className="btn-primary"
          id="report-scam-btn"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus size={16} />
          Report a Scam
        </button>
      </div>

      {/* Stats Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
        }}
        className="stats-grid"
      >
        {[
          { label: "Total Reports", value: totalReports, color: "#818cf8", emoji: "📊" },
          {
            label: "High Risk Scams",
            value: reports.filter((r) => r.verdict === "High Risk / Likely Scam").length,
            color: "#ef4444",
            emoji: "🚨",
          },
          {
            label: "Verified Legit",
            value: reports.filter((r) => r.verdict === "Verified Legit").length,
            color: "#10b981",
            emoji: "✅",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card"
            style={{ padding: "1rem 1.25rem", textAlign: "center" }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{stat.emoji}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#5c6b8a", fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="glass-card"
        style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#5c6b8a",
            }}
          />
          <input
            className="input-base"
            id="community-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location, keyword..."
            style={{ padding: "0.75rem 1rem 0.75rem 2.75rem", fontSize: "0.9rem" }}
          />
        </div>

        {/* Filter row */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#5c6b8a" }}>
            <Filter size={14} />
            <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Filter:</span>
          </div>

          <select
            id="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-base"
            style={{
              padding: "0.5rem 0.875rem",
              fontSize: "0.8125rem",
              width: "auto",
              cursor: "pointer",
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} style={{ background: "#0f1422" }}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>

          <select
            id="verdict-filter"
            value={verdict}
            onChange={(e) => setVerdict(e.target.value)}
            className="input-base"
            style={{
              padding: "0.5rem 0.875rem",
              fontSize: "0.8125rem",
              width: "auto",
              cursor: "pointer",
            }}
          >
            {VERDICTS.map((v) => (
              <option key={v} value={v} style={{ background: "#0f1422" }}>
                {v === "all" ? "All Verdicts" : v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card" style={{ padding: "1.5rem" }}>
              <div className="skeleton" style={{ height: 20, width: "60%", marginBottom: "0.75rem" }} />
              <div className="skeleton" style={{ height: 14, width: "90%", marginBottom: "0.5rem" }} />
              <div className="skeleton" style={{ height: 14, width: "70%" }} />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div
          className="glass-card"
          style={{ padding: "3rem", textAlign: "center" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
          <p style={{ color: "#9aa5c4", fontSize: "1rem" }}>No reports found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {reports.map((report, idx) => {
            const config = verdictConfig[report.verdict] || verdictConfig["Needs Verification"];
            const isUpvoted = upvotedIds.has(report.id);

            return (
              <div
                key={report.id}
                className="glass-card animate-fade-in"
                style={{
                  padding: "1.5rem",
                  animationDelay: `${idx * 0.06}s`,
                  opacity: 0,
                  animationFillMode: "forwards",
                  transition: "transform 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                  {/* Upvote */}
                  <button
                    onClick={() => handleUpvote(report.id)}
                    disabled={isUpvoted}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.25rem",
                      padding: "0.5rem",
                      borderRadius: 10,
                      background: isUpvoted ? "rgba(99, 102, 241, 0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isUpvoted ? "rgba(99, 102, 241, 0.4)" : "rgba(255,255,255,0.08)"}`,
                      cursor: isUpvoted ? "default" : "pointer",
                      transition: "all 0.2s",
                      minWidth: 52,
                    }}
                  >
                    <ThumbsUp
                      size={16}
                      color={isUpvoted ? "#818cf8" : "#5c6b8a"}
                      fill={isUpvoted ? "#818cf8" : "none"}
                    />
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: isUpvoted ? "#818cf8" : "#9aa5c4" }}>
                      {report.upvotes}
                    </span>
                  </button>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                        marginBottom: "0.625rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#f0f4ff",
                          lineHeight: 1.3,
                        }}
                      >
                        {report.title}
                      </h3>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          padding: "0.25rem 0.75rem",
                          borderRadius: 99,
                          background: config.bg,
                          color: config.color,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          border: `1px solid ${config.color}33`,
                        }}
                      >
                        {config.emoji} {report.verdict}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#9aa5c4",
                        lineHeight: 1.6,
                        marginBottom: "0.875rem",
                      }}
                    >
                      {report.description}
                    </p>

                    {/* Meta */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        flexWrap: "wrap",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.75rem",
                          color: "#5c6b8a",
                        }}
                      >
                        <MapPin size={12} /> {report.location}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.75rem",
                          color: "#5c6b8a",
                        }}
                      >
                        <Calendar size={12} />
                        {new Date(report.reportedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span
                        style={{
                          padding: "0.15rem 0.5rem",
                          borderRadius: 99,
                          background: "rgba(99, 102, 241, 0.1)",
                          color: "#818cf8",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          border: "1px solid rgba(99,102,241,0.2)",
                        }}
                      >
                        {report.category}
                      </span>
                      {report.contactInfo && (
                        <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>
                          ⚠️ {report.contactInfo}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {report.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                        {report.tags.map((tag) => (
                          <span key={tag} className="tag-chip">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Form Modal */}
      {showReportForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8, 11, 20, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
          className="animate-fade-in"
        >
          <div
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: 560,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f0f4ff" }}>
                🚨 Report a Job Scam
              </h2>
              <button
                onClick={() => setShowReportForm(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6b8a" }}
              >
                <X size={20} />
              </button>
            </div>

            {submitSuccess ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#10b981",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <p style={{ fontSize: "1.125rem", fontWeight: 700 }}>Report Submitted!</p>
                <p style={{ color: "#9aa5c4", marginTop: "0.5rem" }}>
                  Thank you for helping the community stay safe.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  { label: "Scam Title *", key: "title", placeholder: "e.g., Fake TCS BPO Recruitment via WhatsApp", type: "text" },
                  { label: "Scammer Contact (if known)", key: "contactInfo", placeholder: "e.g., 9876543210 or fake@gmail.com", type: "text" },
                  { label: "Location *", key: "location", placeholder: "e.g., Lucknow, UP", type: "text" },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#9aa5c4", marginBottom: "0.4rem" }}>
                      {field.label}
                    </label>
                    <input
                      className="input-base"
                      type={field.type}
                      required={field.label.includes("*")}
                      value={(formData as Record<string, string>)[field.key]}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{ padding: "0.75rem 1rem" }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#9aa5c4", marginBottom: "0.4rem" }}>
                    Description *
                  </label>
                  <textarea
                    className="input-base"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what happened, what was asked, and any warning signs..."
                    style={{ padding: "0.75rem 1rem", height: 120, resize: "vertical", fontSize: "0.875rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#9aa5c4", marginBottom: "0.4rem" }}>
                      Category
                    </label>
                    <select
                      className="input-base"
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      style={{ padding: "0.75rem 1rem", cursor: "pointer" }}
                    >
                      {CATEGORIES.filter((c) => c !== "all").map((c) => (
                        <option key={c} value={c} style={{ background: "#0f1422" }}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#9aa5c4", marginBottom: "0.4rem" }}>
                      Your Verdict
                    </label>
                    <select
                      className="input-base"
                      value={formData.verdict}
                      onChange={(e) => setFormData((prev) => ({ ...prev, verdict: e.target.value }))}
                      style={{ padding: "0.75rem 1rem", cursor: "pointer" }}
                    >
                      {VERDICTS.filter((v) => v !== "all").map((v) => (
                        <option key={v} value={v} style={{ background: "#0f1422" }}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#9aa5c4", marginBottom: "0.4rem" }}>
                    Tags (comma separated)
                  </label>
                  <input
                    className="input-base"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., WhatsApp Scam, Registration Fee, IT"
                    style={{ padding: "0.75rem 1rem" }}
                  />
                </div>

            {/* BUG-05 fix: show submit error message inside form */}
            {submitError && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  marginBottom: "0.5rem",
                }}
              >
                {submitError}
              </div>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.875rem",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* BUG-02 fix: @keyframes spin lives in globals.css — removed duplicate inline style */}
    </div>
  );
}
