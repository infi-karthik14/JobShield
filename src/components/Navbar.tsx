"use client";

import { Shield, Menu, X, ExternalLink } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  activePage: "verify" | "community";
  onPageChange: (page: "verify" | "community") => void;
}

export default function Navbar({ activePage, onPageChange }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        background: "rgba(8, 11, 20, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(99, 102, 241, 0.15)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => onPageChange("verify")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
            }}
          >
            <Shield size={20} color="white" strokeWidth={2.5} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 800,
                background: "linear-gradient(135deg, #f0f4ff, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              JobShield AI
            </div>
            <div style={{ fontSize: "0.65rem", color: "#5c6b8a", fontWeight: 500, letterSpacing: "0.05em" }}>
              SCAM VERIFIER
            </div>
          </div>
        </button>

        {/* Desktop Nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
          className="desktop-nav"
        >
          <button
            className={`nav-link tab-btn ${activePage === "verify" ? "active" : ""}`}
            onClick={() => onPageChange("verify")}
          >
            🔍 Verify Job
          </button>
          <button
            className={`nav-link tab-btn ${activePage === "community" ? "active" : ""}`}
            onClick={() => onPageChange("community")}
          >
            🚨 Scam Board
          </button>

          <div
            style={{
              width: 1,
              height: 20,
              background: "rgba(99, 102, 241, 0.2)",
              margin: "0 0.5rem",
            }}
          />

          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#ef4444",
              padding: "0.4rem 0.75rem",
              borderRadius: 8,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            🆘 Report Cybercrime
            <ExternalLink size={11} />
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen((v) => !v)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9aa5c4",
            padding: "0.5rem",
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            background: "rgba(15, 20, 34, 0.98)",
            borderTop: "1px solid rgba(99, 102, 241, 0.15)",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
          className="mobile-menu"
        >
          <button
            className={`tab-btn ${activePage === "verify" ? "active" : ""}`}
            onClick={() => { onPageChange("verify"); setMobileOpen(false); }}
            style={{ textAlign: "left", width: "100%" }}
          >
            🔍 Verify Job Posting
          </button>
          <button
            className={`tab-btn ${activePage === "community" ? "active" : ""}`}
            onClick={() => { onPageChange("community"); setMobileOpen(false); }}
            style={{ textAlign: "left", width: "100%" }}
          >
            🚨 Community Scam Board
          </button>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#ef4444",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
              padding: "0.5rem 1rem",
            }}
          >
            🆘 Report Cybercrime (1930)
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
