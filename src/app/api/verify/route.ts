import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runMockVerification } from "@/lib/mockEngine";
import { VerificationResult } from "@/types";

// ─── ML Model: Gemini 2.5 Flash ───────────────────────────────────────────────
// Upgraded from gemini-2.0-flash → gemini-2.5-flash with thinking mode enabled.
// Thinking mode gives the model an internal reasoning step before answering,
// producing more accurate, consistent scam verdicts with fewer hallucinations.

const GEMINI_MODEL = "gemini-2.5-flash";

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const VerificationSchema = z.object({
  trustScore: z.number().min(0).max(100),
  verdict: z.enum(["Verified Legit", "Needs Verification", "High Risk / Likely Scam"]),
  summary: z.string(),
  redFlags: z.array(z.string()),
  positiveSignals: z.array(z.string()),
  recommendations: z.array(z.string()),
});

// ─── Gemini 2.5 Flash System Prompt ──────────────────────────────────────────
// Enhanced for 2.5's superior reasoning — more granular Indian scam patterns,
// explicit scoring rubric, and edge-case guidance.

const SYSTEM_PROMPT = `You are JobShield AI, an expert employment fraud detection system specializing in the Indian job market (2024-2026).
You analyze job postings, WhatsApp forwards, recruitment emails, SMS messages, social-media ads, and pamphlets to protect college students, fresh graduates, and blue-collar job seekers from scams.

## Output Format
Return ONLY a valid JSON object. No markdown fences, no explanation outside the JSON.

{
  "trustScore": <integer 0-100, where 100 = completely trustworthy>,
  "verdict": <"Verified Legit" | "Needs Verification" | "High Risk / Likely Scam">,
  "summary": <2-3 sentence human-readable analysis, citing specific evidence from the text>,
  "redFlags": <array of specific, evidence-backed red flag strings — quote the exact suspicious phrase where possible>,
  "positiveSignals": <array of concrete positive indicators found in the text>,
  "recommendations": <array of 3-5 actionable, India-specific safety steps the reader should take>
}

## Trust Score Calibration
- 0–34  → "High Risk / Likely Scam"     (multiple hard scam signals)
- 35–64 → "Needs Verification"           (ambiguous; some concern)
- 65–100 → "Verified Legit"              (strong legitimate signals)

If any HARD SCAM signal is present, trustScore MUST be ≤ 34.

## HARD SCAM Signals (any one → High Risk)
- Upfront money demand: registration fee, training fee, security deposit, kit fee, ID card fee, uniform fee, joining fee, processing fee, courier fee, laptop deposit, advance payment
- Interview/hiring conducted exclusively on WhatsApp or Telegram with no formal HR process
- Corporate email using @gmail.com, @yahoo.com, @outlook.com, @hotmail.com, @rediffmail.com
- Company name impersonating a known brand (TCS, Infosys, Wipro, Accenture, Amazon, Flipkart, Zomato, Swiggy, Reliance, L&T, HCL, etc.) with no verifiable CIN/GST
- Requests for Aadhaar, PAN, bank account, or OTP before any formal offer letter
- Promises of daily/weekly cash payouts, "unlimited earnings", or guaranteed work-from-home income
- Task-based fraud: liking/subscribing YouTube channels, writing fake reviews, completing "tasks" for pay
- Lottery-style recruitment: "You have been selected", "Congratulations, you are hired" without an interview
- No physical verifiable address, or address leads to residential flat/unrelated business

## MEDIUM RISK Signals (lower trustScore by 10–20 each)
- No company website or LinkedIn page mentioned
- Salary range unrealistically high for the role/qualification (e.g., ₹40,000/month for 10th pass data entry)
- Walk-in drives with urgent/scarcity language ("limited seats", "today only", "immediate joining")
- Mentions WhatsApp as the primary application channel
- No mention of PF/ESI, offer letter, or formal onboarding
- Spelling errors or excessive use of CAPS and emojis in a "corporate" posting
- Short job description with no mention of actual responsibilities

## POSITIVE Signals (raise trustScore by 10–15 each)
- Official corporate email domain (not Gmail/Yahoo/Outlook)
- LinkedIn, Naukri.com, Indeed.com, Instahyre.com, or Glassdoor job page URL
- CIN or GST number present (even if unverified) and consistent with stated company name
- EPF/ESI, gratuity, or statutory benefits mentioned
- Multi-round formal interview process described
- Physical office address with known landmark in a business district
- Background verification / document check mentioned
- Offer letter / appointment letter process described

## India-Specific Context
- Legitimate large companies (TCS, Infosys, Wipro, etc.) NEVER charge any fee at any stage
- Government jobs are announced ONLY on official .gov.in portals (RRB, SSC, UPSC, NHM, etc.)
- Any "government job" recruiting via WhatsApp, pamphlets, or non-.gov.in email is a scam
- Real IT companies conduct coding tests on platforms like HackerRank, Mettl, or their own portal
- "Refundable" deposits are a classic advance-fee fraud tactic — the money is never returned

Return ONLY the JSON object.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip HTML tags and collapse whitespace to get readable text from a webpage */
function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 6000); // 2.5 Flash handles larger context — bump from 4000
}

/** Fetch a URL server-side and return its readable text content */
async function scrapeUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s for 2.5
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; JobShieldBot/2.0; +https://jobshield.ai)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const text = extractTextFromHtml(html);
    return text.length > 50
      ? text
      : `URL: ${url}\n[Page content could not be extracted — analyzing URL domain and structure only]`;
  } catch {
    clearTimeout(timeout);
    return `URL: ${url}\n[Could not fetch page — analyzing URL domain and structure only]`;
  }
}

/**
 * Initialize GoogleGenAI with Gemini 2.5 Flash + thinking enabled.
 * Thinking mode gives the model an internal chain-of-thought before output,
 * significantly improving accuracy for nuanced scam detection.
 */
async function getGeminiClient(apiKey: string) {
  const { GoogleGenAI } = await import("@google/genai");
  return new GoogleGenAI({ apiKey });
}

/** Run Gemini 2.5 Flash text analysis with thinking mode */
async function runGeminiText(
  apiKey: string,
  text: string
): Promise<VerificationResult | null> {
  try {
    const genAI = await getGeminiClient(apiKey);
    const prompt = `Analyze this job posting content for employment fraud:\n\n${text}`;

    const result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        // Thinking mode: internal reasoning before final answer.
        // Budget of 8192 tokens gives thorough analysis without excessive latency.
        thinkingConfig: {
          thinkingBudget: 8192,
        },
        temperature: 0.1,   // Low temperature → consistent, deterministic verdicts
        maxOutputTokens: 1024,
      },
    });

    const rawText = result.candidates?.[0]?.content?.parts
      ?.filter((p: { text?: string; thought?: boolean }) => !p.thought)  // skip thinking tokens
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("") ?? "";

    // Strip any accidental markdown fences
    const jsonStr = rawText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonStr);
    return VerificationSchema.parse(parsed) as VerificationResult;
  } catch {
    return null;
  }
}

/** Run Gemini 2.5 Flash Vision — OCR + scam detection in one pass */
async function runGeminiVision(
  apiKey: string,
  base64Data: string,
  mimeType: string
): Promise<VerificationResult | null> {
  try {
    const genAI = await getGeminiClient(apiKey);

    // Step 1: OCR — extract all text visible in the image
    const ocrResult = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: "Extract ALL text visible in this image exactly as written. This is a job posting, advertisement, recruitment pamphlet, or WhatsApp screenshot. Preserve formatting clues (ALL CAPS, phone numbers, email addresses, amounts in ₹). Return only the raw extracted text, nothing else.",
            },
          ],
        },
      ],
      config: {
        thinkingConfig: { thinkingBudget: 2048 }, // OCR needs less reasoning
        temperature: 0,
        maxOutputTokens: 2048,
      },
    });

    const extractedText =
      ocrResult.candidates?.[0]?.content?.parts
        ?.filter((p: { thought?: boolean }) => !p.thought)
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("") ?? "";

    if (!extractedText || extractedText.trim().length < 10) {
      return null;
    }

    // Step 2: Analyze extracted text with full scam detection
    const analysisResult = await runGeminiText(
      apiKey,
      `[Extracted from image via OCR — Gemini 2.5 Flash Vision]\n\n${extractedText}`
    );

    return analysisResult;
  } catch {
    return null;
  }
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      inputType = "text",
      imageData,
      imageMimeType,
    } = body as {
      text: string;
      inputType?: "text" | "url" | "image";
      imageData?: string;   // base64 for image uploads
      imageMimeType?: string;
    };

    if (!text || text.trim().length < 5) {
      return NextResponse.json(
        { error: "Input text is too short for analysis." },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;

    // ── Image: Gemini 2.5 Flash Vision OCR ──
    if (inputType === "image" && imageData && imageMimeType && geminiKey) {
      const visionResult = await runGeminiVision(geminiKey, imageData, imageMimeType);
      if (visionResult) {
        const finalResult: VerificationResult = {
          ...visionResult,
          analysedAt: new Date().toISOString(),
          inputType: "image",
          inputPreview: "[Image analysed via Gemini 2.5 Flash Vision OCR]",
        };
        return NextResponse.json(finalResult);
      }
      // Fall through to mock if vision fails
    }

    // ── URL: server-side scrape → Gemini 2.5 Flash analysis ──
    if (inputType === "url" && geminiKey) {
      const rawUrl = text.replace(/^Job posting URL:\s*/i, "").trim();
      const scrapedText = await scrapeUrl(rawUrl);
      const aiResult = await runGeminiText(geminiKey, `URL: ${rawUrl}\n\n${scrapedText}`);
      if (aiResult) {
        const finalResult: VerificationResult = {
          ...aiResult,
          analysedAt: new Date().toISOString(),
          inputType: "url",
          inputPreview: rawUrl.slice(0, 120),
        };
        return NextResponse.json(finalResult);
      }
      // Fall through to mock
    }

    // ── Text: Gemini 2.5 Flash with thinking ──
    if (geminiKey) {
      const aiResult = await runGeminiText(geminiKey, text);
      if (aiResult) {
        const finalResult: VerificationResult = {
          ...aiResult,
          analysedAt: new Date().toISOString(),
          inputType,
          inputPreview: text.slice(0, 120),
        };
        return NextResponse.json(finalResult);
      }
    }

    // ── Fallback: Heuristic Mock Engine (no API key or AI failure) ──
    const mockResult = runMockVerification(text, inputType);
    return NextResponse.json(mockResult);
  } catch (error) {
    console.error("Verify API error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
