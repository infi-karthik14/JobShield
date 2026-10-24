"use client";

import { useState, useRef, useCallback } from "react";
import {
  FileText,
  Link2,
  ImageIcon,
  Upload,
  Loader2,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { VerificationResult } from "@/types";

interface InputPanelProps {
  onResult: (result: VerificationResult) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}

type Tab = "text" | "url" | "image";

const DEMO_SCAM_TEXT = `URGENT HIRING!! 🔥
Company: Infosys Limited (Official Partner)
Position: Data Entry Operator / BPO Executive
Salary: ₹25,000 - ₹45,000/month
Qualification: 10th/12th Pass / Any Graduate
No Experience Required ✅

👉 WALK-IN INTERVIEW: Daily 10AM-5PM
📍 Gomti Nagar, Lucknow (Near Metro)

⚠️ Registration fee: ₹2,500 (REFUNDABLE after joining)
Contact: 9876543210 (WhatsApp Only)
Email: infosys.hiring2026@gmail.com

NOTE: Limited seats! First come first serve basis.
Send your resume on WhatsApp immediately!`;

export default function InputPanel({ onResult, isLoading, setIsLoading }: InputPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("text");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WebP, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }
    setImageFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      // Strip the data URL prefix to get raw base64
      const base64 = result.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleSubmit = async () => {
    setError(null);

    let textToAnalyze = "";
    let inputType: "text" | "url" | "image" = activeTab;
    let imageData: string | undefined;
    let imageMimeType: string | undefined;

    if (activeTab === "text") {
      if (textInput.trim().length < 10) {
        setError("Please enter at least 10 characters to analyze.");
        return;
      }
      textToAnalyze = textInput;
    } else if (activeTab === "url") {
      if (!urlInput.trim()) {
        setError("Please enter a URL to analyze.");
        return;
      }
      // BUG-04 fix: validate URL format before submitting
      try {
        new URL(urlInput.trim());
      } catch {
        setError("Please enter a valid URL starting with http:// or https://");
        return;
      }
      textToAnalyze = urlInput.trim();
      inputType = "url";
    } else if (activeTab === "image") {
      if (!imageFile) {
        setError("Please upload an image to analyze.");
        return;
      }
      textToAnalyze = `[Image: ${imageFile.name}]`;
      inputType = "image";
      if (imageBase64) {
        imageData = imageBase64;
        imageMimeType = imageFile.type;
      }
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToAnalyze, inputType, imageData, imageMimeType }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Verification failed");
      }

      const result: VerificationResult = await response.json();
      onResult(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemo = () => {
    setActiveTab("text");
    setTextInput(DEMO_SCAM_TEXT);
    setError(null);
  };

  const tabs = [
    { id: "text" as Tab, label: "Paste Text", icon: FileText, desc: "WhatsApp message, email, or SMS" },
    { id: "url" as Tab, label: "URL Checker", icon: Link2, desc: "Job posting link — we fetch and analyse the full page" },
    { id: "image" as Tab, label: "Upload Image", icon: ImageIcon, desc: "Screenshot or poster — AI reads the text via OCR" },
  ];

  return (
    <div
      className="glass-card animate-fade-in-up"
      style={{ padding: "1.75rem", overflow: "hidden" }}
    >
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#f0f4ff",
                marginBottom: "0.25rem",
              }}
            >
              Analyze Job Posting
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "#9aa5c4" }}>
              Paste the content or URL of any suspicious job offer
            </p>
          </div>
          <button
            onClick={loadDemo}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              background: "rgba(6, 182, 212, 0.1)",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              color: "#22d3ee",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            <Sparkles size={14} />
            Load Demo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.375rem",
          background: "rgba(22, 29, 48, 0.6)",
          borderRadius: 10,
          padding: "0.25rem",
          marginBottom: "1.5rem",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => { setActiveTab(tab.id); setError(null); }}
            style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}
            id={`tab-${tab.id}`}
          >
            <tab.icon size={15} />
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Description */}
      <p style={{ fontSize: "0.8125rem", color: "#5c6b8a", marginBottom: "1rem" }}>
        {tabs.find((t) => t.id === activeTab)?.desc}
      </p>

      {/* Text Input */}
      {activeTab === "text" && (
        <textarea
          className="input-base"
          id="text-input"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste a WhatsApp job message, email, or job description here...

Example:
'Urgent hiring! TCS BPO – ₹25,000/month. Registration fee ₹2,500 required. Contact on WhatsApp only.'"
          style={{
            height: 220,
            padding: "1rem",
            resize: "vertical",
            fontSize: "0.875rem",
            lineHeight: 1.6,
          }}
        />
      )}

      {/* URL Input */}
      {activeTab === "url" && (
        <div>
          <input
            className="input-base"
            id="url-input"
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/jobs/software-engineer"
            style={{ padding: "0.875rem 1rem", fontSize: "0.9375rem" }}
          />
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.8rem",
              color: "#5c6b8a",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.375rem",
            }}
          >
            <AlertCircle size={13} style={{ marginTop: "1px", flexShrink: 0, color: "#f59e0b" }} />
            Paste the full job posting URL. Our engine will analyze the domain, email patterns, and structure.
          </p>
        </div>
      )}

      {/* Image Upload */}
      {activeTab === "image" && (
        <div>
          <div
            className={`upload-zone ${dragOver ? "drag-over" : ""}`}
            style={{
              padding: "2rem 1.5rem",
              textAlign: "center",
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              position: "relative",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  style={{
                    maxHeight: 160,
                    maxWidth: "100%",
                    borderRadius: 8,
                    objectFit: "contain",
                  }}
                />
                <p style={{ fontSize: "0.8125rem", color: "#10b981", fontWeight: 600 }}>
                  ✓ {imageFile?.name}
                </p>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: "rgba(99, 102, 241, 0.12)",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Upload size={24} color="#6366f1" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "#f0f4ff", marginBottom: "0.25rem" }}>
                    Drop image here or click to upload
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "#5c6b8a" }}>
                    JPG, PNG, WebP, GIF — up to 10MB
                  </p>
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              id="image-upload"
            />
          </div>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.8rem",
              color: "#5c6b8a",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.375rem",
            }}
          >
            <AlertCircle size={13} style={{ marginTop: "1px", flexShrink: 0, color: "#f59e0b" }} />
            Upload a screenshot of a job posting, WhatsApp forward, pamphlet, or walk-in circular.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: 8,
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
            fontSize: "0.875rem",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={isLoading}
        id="verify-btn"
        style={{
          width: "100%",
          marginTop: "1.25rem",
          padding: "0.875rem 1.5rem",
          fontSize: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.625rem",
        }}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            Analyzing with AI...
          </>
        ) : (
          <>
            <span style={{ fontSize: "1.1rem" }}>🛡️</span>
            Verify This Job Posting
            <ChevronRight size={18} />
          </>
        )}
      </button>

      {/* BUG-02 fix: @keyframes spin lives in globals.css — removed duplicate inline style */}
      <style>{`
        @media (max-width: 480px) {
          .tab-label { display: none; }
        }
      `}</style>
    </div>
  );
}
