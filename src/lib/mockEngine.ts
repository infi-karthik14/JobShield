import { VerificationResult, EmployerCheck } from "@/types";

// ─── Keyword / Heuristic Banks ───────────────────────────────────────────────

const HIGH_RISK_KEYWORDS = [
  "registration fee",
  "training fee",
  "security deposit",
  "refundable deposit",
  "joining fee",
  "processing fee",
  "kit fee",
  "material fee",
  "advance payment",
  "pay before joining",
  "payment required",
  "send money",
  "transfer amount",
  "telegram only",
  "whatsapp interview",
  "no experience needed",
  "unlimited earnings",
  "work from home guaranteed",
  "earn ₹",
  "earn rs.",
  "daily payout",
  "weekly payout",
  "part time earn",
  "data entry job",
  "online typing job",
  "captcha job",
  "like and subscribe job",
  "lottery winner",
  "selected candidate",
  "urgent hiring",
  "immediate joining",
  "no qualification",
  "12th pass",
  "fresher only",
  "contact on whatsapp",
  "click the link",
  "limited seats",
  "first come first",
];

const MEDIUM_RISK_KEYWORDS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "work from home",
  "freelance",
  "part time",
  "home based",
  "no interview",
  "instant selection",
  "salary negotiable",
  "high salary",
  "massive income",
  "big earning",
];

const POSITIVE_KEYWORDS = [
  "careers.",
  "jobs.",
  ".com/careers",
  "linkedin.com",
  "naukri.com",
  "indeed.com",
  "instahyre.com",
  "glassdoor.com",
  "cin:",
  "gst:",
  "llp",
  "pvt. ltd",
  "private limited",
  "mca.gov.in",
  "epf",
  "esi",
  "background verification",
  "offer letter",
  "appointment letter",
  "hr@",
  "recruitment@",
  "talent@",
];

const EMAIL_SCAM_PATTERN = /@gmail\.com|@yahoo\.com|@outlook\.com|@hotmail\.com/i;
const FEE_AMOUNT_PATTERN = /₹\s*\d+|rs\.?\s*\d+|\d+\s*rupees/i;
const PHONE_PATTERN = /\b[6-9]\d{9}\b/;

// ─── Mock Engine ─────────────────────────────────────────────────────────────

export function runMockVerification(
  inputText: string,
  inputType: "text" | "url" | "image" = "text"
): VerificationResult {
  const text = inputText.toLowerCase();

  let riskScore = 0;
  const redFlags: string[] = [];
  const positiveSignals: string[] = [];
  const recommendations: string[] = [];

  // Check high-risk keywords
  let highHits = 0;
  for (const kw of HIGH_RISK_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) {
      highHits++;
      if (redFlags.length < 8) {
        const label = formatFlag(kw, text);
        if (label && !redFlags.includes(label)) redFlags.push(label);
      }
    }
  }

  // Check medium-risk keywords
  let mediumHits = 0;
  for (const kw of MEDIUM_RISK_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) {
      mediumHits++;
    }
  }

  // Check positive keywords
  let positiveHits = 0;
  for (const kw of POSITIVE_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) {
      positiveHits++;
      if (positiveSignals.length < 5) {
        positiveSignals.push(formatPositive(kw));
      }
    }
  }

  // Specific pattern checks
  if (EMAIL_SCAM_PATTERN.test(inputText)) {
    riskScore += 20;
    if (!redFlags.includes("Uses personal/public email instead of corporate domain")) {
      redFlags.push("Uses personal/public email instead of corporate domain (@gmail/@yahoo/@outlook)");
    }
  }

  if (FEE_AMOUNT_PATTERN.test(inputText)) {
    riskScore += 25;
    const match = inputText.match(FEE_AMOUNT_PATTERN);
    if (match && !redFlags.some((f) => f.includes("payment"))) {
      redFlags.push(`Demands monetary payment: "${match[0].trim()}" — a classic scam indicator`);
    }
  }

  if (PHONE_PATTERN.test(inputText) && !text.includes("careers") && !text.includes("official")) {
    riskScore += 5;
  }

  // Score calculation
  riskScore += highHits * 15;
  riskScore += mediumHits * 7;
  riskScore = Math.min(riskScore, 95);
  riskScore -= positiveHits * 10;
  riskScore = Math.max(riskScore, 5);

  // Baseline for very short / empty input
  if (inputText.trim().length < 30) {
    riskScore = 50;
  }

  const trustScore = 100 - riskScore;

  // Verdict
  let verdict: VerificationResult["verdict"];
  if (trustScore >= 65) {
    verdict = "Verified Legit";
  } else if (trustScore >= 35) {
    verdict = "Needs Verification";
  } else {
    verdict = "High Risk / Likely Scam";
  }

  // Employer checks
  const employerChecks: EmployerCheck[] = [
    {
      label: "Corporate Email Domain",
      status: EMAIL_SCAM_PATTERN.test(inputText) ? "fail" : positiveHits > 0 ? "pass" : "unknown",
      detail: EMAIL_SCAM_PATTERN.test(inputText)
        ? "Uses public email (Gmail/Yahoo/Outlook) — not professional"
        : "No public email domain detected",
    },
    {
      label: "Fee / Deposit Request",
      status: FEE_AMOUNT_PATTERN.test(inputText) || highHits > 0 ? "fail" : "pass",
      detail: FEE_AMOUNT_PATTERN.test(inputText)
        ? "Monetary demand detected — never pay to get a job"
        : "No upfront fee demand found",
    },
    {
      label: "Official Job Portal Link",
      status: positiveHits > 2 ? "pass" : positiveHits > 0 ? "warn" : "unknown",
      detail:
        positiveHits > 0
          ? "References to known job portals detected"
          : "No verified job portal links found",
    },
    {
      label: "Company Registration (MCA/GST)",
      status: text.includes("cin:") || text.includes("gst:") || text.includes("pvt. ltd") ? "pass" : "unknown",
      detail: text.includes("cin:") || text.includes("gst:")
        ? "Company registration indicators found"
        : "No CIN/GST registration number mentioned",
    },
    {
      label: "Physical Address",
      status: text.includes("address") || text.includes("floor") || text.includes("nagar") || text.includes("road") ? "warn" : "unknown",
      detail:
        text.includes("address") || text.includes("nagar") || text.includes("road")
          ? "Address mentioned — verify physically before visiting"
          : "No physical office address mentioned",
    },
  ];

  // Summary
  let summary = "";
  if (trustScore < 35) {
    summary = `This job posting shows ${redFlags.length} critical red flag(s) including ${
      redFlags[0] || "suspicious patterns"
    }. Multiple indicators strongly suggest this is a fraudulent recruitment offer.`;
  } else if (trustScore < 65) {
    summary = `This posting has ${redFlags.length > 0 ? `${redFlags.length} concern(s)` : "some ambiguities"} that require independent verification before proceeding. Exercise caution and do not share personal documents.`;
  } else {
    summary = `This job posting appears relatively legitimate with ${positiveSignals.length} positive signal(s). However, always verify independently before attending interviews or sharing personal data.`;
  }

  // Recommendations
  if (trustScore < 65) {
    recommendations.push("Do NOT transfer any money, even if promised full refund after joining.");
    recommendations.push("Never share Aadhaar, PAN, or bank details before a confirmed written offer letter.");
  }
  if (redFlags.some((f) => f.toLowerCase().includes("email"))) {
    recommendations.push("Verify the recruiter on the company's official website — search directly on Google.");
  }
  recommendations.push("Cross-check the company on MCA portal: https://www.mca.gov.in");
  recommendations.push("Report suspected job scams on National Cyber Crime Portal: cybercrime.gov.in or call 1930.");
  if (text.includes("telegram") || text.includes("whatsapp")) {
    recommendations.push("Legitimate employers never conduct interviews solely via Telegram or WhatsApp.");
  }

  return {
    trustScore,
    verdict,
    summary,
    redFlags: redFlags.length > 0 ? redFlags : ["No critical red flags identified in heuristic scan"],
    positiveSignals:
      positiveSignals.length > 0
        ? positiveSignals
        : ["No strong positive signals detected — treat with caution"],
    recommendations,
    employerChecks,
    analysedAt: new Date().toISOString(),
    inputType,
    inputPreview: inputText.slice(0, 120).trim(),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFlag(keyword: string, text: string): string {
  const flagMap: Record<string, string> = {
    "registration fee": "Demands registration/joining fee before employment",
    "training fee": "Requires payment for training materials",
    "security deposit": "Asks for a 'refundable' security deposit",
    "refundable deposit": "Suspicious 'refundable' deposit requirement",
    "joining fee": "Upfront joining fee demanded — a scam hallmark",
    "processing fee": "Processing/application fee requested",
    "kit fee": "Asks for payment for 'interview kit' or work material",
    "telegram only": "Interview/communication restricted to Telegram only",
    "whatsapp interview": "Interview conducted exclusively on WhatsApp",
    "unlimited earnings": "Unrealistic 'unlimited earnings' promise",
    "earn ₹": "Specific income promise without role/skills clarity",
    "no experience needed": "Claims no experience needed for high-paying roles",
    "urgent hiring": "Artificial urgency tactics to pressure quick decisions",
    "immediate joining": "Pressures immediate joining without proper process",
    "limited seats": "False scarcity: 'limited seats available'",
  };
  return flagMap[keyword] || `Suspicious keyword detected: "${keyword}"`;
}

function formatPositive(keyword: string): string {
  const positiveMap: Record<string, string> = {
    "linkedin.com": "LinkedIn profile or link present — verifiable",
    "naukri.com": "Listed on Naukri.com — a recognized job portal",
    "indeed.com": "Indeed.com posting — adds some credibility",
    "cin:": "Company Identification Number (CIN) mentioned — verifiable on MCA",
    "gst:": "GST number present — company is tax-registered",
    "pvt. ltd": "Private Limited company structure mentioned",
    "private limited": "Registered company type (Pvt. Ltd.) mentioned",
    "hr@": "HR department email address found",
    "recruitment@": "Dedicated recruitment email — professional indicator",
    "offer letter": "Mentions formal offer letter process",
    "background verification": "Background verification process mentioned",
    epf: "EPF (Employee Provident Fund) contribution mentioned",
    esi: "ESI (Employee State Insurance) mentioned — statutory benefit",
  };
  return positiveMap[keyword] || `Positive signal: "${keyword}"`;
}
