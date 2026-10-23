import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runMockVerification } from "@/lib/mockEngine";
import { VerificationResult } from "@/types";

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const VerificationSchema = z.object({
  trustScore: z.number().min(0).max(100),
  verdict: z.enum(["Verified Legit", "Needs Verification", "High Risk / Likely Scam"]),
  summary: z.string(),
  redFlags: z.array(z.string()),
  positiveSignals: z.array(z.string()),
  recommendations: z.array(z.string()),
});

// ─── Gemini AI System Prompt ──────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are JobShield AI, an expert employment fraud detection system specializing in the Indian job market. 
You analyze job postings, recruitment messages, and employment offers to detect scams targeting college students, fresh graduates, and local job seekers.

Evaluate the provided content and return ONLY a valid JSON object matching this exact schema:
{
  "trustScore": <number 0-100 where 100 = fully trustworthy>,
  "verdict": <"Verified Legit" | "Needs Verification" | "High Risk / Likely Scam">,
  "summary": <1-2 sentence analysis summary>,
  "redFlags": <array of specific red flag strings found>,
  "positiveSignals": <array of positive indicators found>,
  "recommendations": <array of actionable advice strings>
}

RED FLAG INDICATORS to detect:
- Any upfront payment requests (registration fee, training fee, security deposit, kit fee)
- Telegram/WhatsApp-only interview process
- Gmail/Yahoo/Outlook used as official corporate email
- Unrealistically high pay for minimal skills
- Vague job descriptions with no clear responsibilities
- Requests for Aadhaar/PAN before formal offer
- Fake company names (impersonating TCS, Infosys, Wipro, Amazon, etc.)
- No physical address or unverifiable address
- Spelling errors, excessive CAPS, urgency pressure tactics
- Missing CIN, GST, or any company registration details

POSITIVE SIGNALS:
- Official corporate email domains
- LinkedIn/Naukri/Indeed job portal links
- MCA/CIN number mentioned and verifiable
- EPF/ESI benefits mentioned
- Formal interview process described
- Physical office address with landmark
- Background verification mentioned

Trust Score Guidelines:
- 0-34: High Risk / Likely Scam
- 35-64: Needs Verification  
- 65-100: Verified Legit

Return ONLY the JSON, no markdown, no explanation.`;

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
    .slice(0, 4000); // keep under token limits
}

/** Fetch a URL server-side and return its readable text content */
async function scrapeUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; JobShieldBot/1.0; +https://jobshield.ai)",
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

/** Run Gemini text analysis */
async function runGeminiText(
  apiKey: string,
  text: string
): Promise<VerificationResult | null> {
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const genAI = new GoogleGenAI({ apiKey });
    const prompt = `${SYSTEM_PROMPT}\n\nAnalyze this job posting content:\n\n${text}`;
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const jsonStr = rawText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonStr);
    return VerificationSchema.parse(parsed) as VerificationResult;
  } catch {
    return null;
  }
}

/** Run Gemini Vision analysis on a base64 image — OCR + scam detection */
async function runGeminiVision(
  apiKey: string,
  base64Data: string,
  mimeType: string
): Promise<VerificationResult | null> {
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const genAI = new GoogleGenAI({ apiKey });

    // First, extract text from the image
    const ocrResult = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
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
              text: "Extract ALL text visible in this image exactly as written. This is a job posting, advertisement, or recruitment message. Return only the raw extracted text, nothing else.",
            },
          ],
        },
      ],
    });

    const extractedText =
      ocrResult.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!extractedText || extractedText.trim().length < 10) {
      return null;
    }

    // Now analyze the extracted text for scam indicators
    const analysisResult = await runGeminiText(
      apiKey,
      `[Extracted from image via OCR]\n\n${extractedText}`
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

    // ── Image: Gemini Vision OCR ──
    if (inputType === "image" && imageData && imageMimeType && geminiKey) {
      const visionResult = await runGeminiVision(geminiKey, imageData, imageMimeType);
      if (visionResult) {
        const finalResult: VerificationResult = {
          ...visionResult,
          analysedAt: new Date().toISOString(),
          inputType: "image",
          inputPreview: "[Image analysed via Gemini Vision OCR]",
        };
        return NextResponse.json(finalResult);
      }
      // Fall through to mock if vision fails
    }

    // ── URL: server-side scrape then AI ──
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

    // ── Text: Try Gemini AI ──
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

    // ── Fallback: Mock Heuristic Engine ──
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
