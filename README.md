# 🛡️ JobShield AI — Job Scam Detector for India

> **Protect college students and fresh graduates from fake job offers, registration fee scams, and fraudulent recruiters.**

---

## 🎯 What Problem Does This Solve?

Every year, **thousands of students in India** lose money to fake job scams:
- A WhatsApp message says "TCS is hiring, pay ₹2,500 registration fee"
- A pamphlet at college claims "Amazon packing job, ₹15,000/month, walk-in today"
- An Instagram ad promises "₹800/day typing job — pay ₹999 software fee first"

Most students can't tell what's real. **JobShield AI can.**

---

## 💡 How It Works (Simple Explanation for Judges)

```
User pastes a job message / URL / screenshot
           ↓
    JobShield AI sends it to
    Google Gemini 2.5 Flash (ML Model)
           ↓
    Gemini THINKS about it (Thinking Mode)
    — checks for 30+ scam patterns —
           ↓
    Returns a Trust Score (0–100%)
    + Verdict + Red Flags + Safe Steps
           ↓
    Results shown on screen
    User can download a PDF report
```

### The 3-Layer Architecture

| Layer | What it does | Technology |
|---|---|---|
| **Frontend** | User interface — input, results, community board | Next.js + React |
| **API Route** | Receives input, calls the ML model, returns JSON | Next.js API Route |
| **ML Model** | Analyses the job text for scam patterns | Google Gemini 2.5 Flash |

---

## 🧠 The ML Model — Gemini 2.5 Flash with Thinking

We use **Google Gemini 2.5 Flash** — Google's latest and most capable lightweight language model.

### Why Gemini 2.5 Flash?
- **Multimodal** — understands text, URLs, and images (screenshots of job ads)
- **Thinking Mode** — the model reasons step-by-step internally before giving an answer, like a detective reviewing evidence before reaching a verdict
- **India-aware** — we gave it a detailed system prompt teaching it Indian-specific scam patterns (RRB fake jobs, TCS/Infosys impersonation, ₹ fee demands, etc.)
- **Fast** — < 5 seconds for a full analysis

### What the model looks for
The model is given a **System Prompt** (like a job description for the AI) that teaches it to look for:

**Hard Scam Signals (any one = High Risk)**
- Upfront money: "registration fee", "kit fee", "refundable deposit"
- Personal email as corporate: `@gmail.com`, `@yahoo.com` for "company" contact
- Company impersonation: fake "TCS", "Infosys", "Amazon" without verifiable CIN
- Interview on WhatsApp/Telegram only
- Requests for Aadhaar/PAN before an offer letter

**Positive Signals**
- Official corporate email domain
- Naukri.com / LinkedIn / Indeed links
- CIN/GST number present
- EPF/ESI benefits mentioned
- Formal multi-round interview process

---

## 🗂️ Project Structure (What Each File Does)

```
src/
├── app/
│   ├── page.tsx              ← Main page — handles state, shows hero/form/results
│   ├── layout.tsx            ← HTML wrapper, SEO metadata, fonts
│   ├── globals.css           ← All styles (dark theme, animations, components)
│   └── api/
│       ├── verify/
│       │   └── route.ts      ← 🧠 THE BRAIN — calls Gemini 2.5 Flash, returns verdict
│       └── community-reports/
│           └── route.ts      ← Community scam board API (GET/POST/PATCH)
├── components/
│   ├── Navbar.tsx            ← Top navigation bar
│   ├── HeroSection.tsx       ← Landing page hero with stats and features
│   ├── InputPanel.tsx        ← Input form (text / URL / image upload tabs)
│   ├── ResultsDashboard.tsx  ← Shows trust score, red flags, recommendations
│   ├── TrustScoreMeter.tsx   ← Animated circular score ring
│   └── CommunityBoard.tsx    ← Browse/submit community scam reports
├── lib/
│   ├── mockEngine.ts         ← Fallback heuristic engine (no API key needed)
│   └── communityData.ts      ← Sample community reports data
└── types/
    └── index.ts              ← TypeScript types shared across the app
```

---

## 🔄 Request Flow — Step by Step

1. **User** pastes a job message and clicks "Verify"
2. **InputPanel** (`InputPanel.tsx`) sends a POST request to `/api/verify`
3. **API Route** (`verify/route.ts`) receives it:
   - If image → Gemini Vision OCR extracts text first, then analyses
   - If URL → server scrapes the webpage, then analyses
   - If text → sends directly to Gemini 2.5 Flash
4. **Gemini 2.5 Flash** (with Thinking Mode) reads the system prompt + job text and returns a structured JSON with trust score, verdict, red flags, positive signals, and recommendations
5. **API Route** validates the JSON with Zod schema, returns it to frontend
6. **ResultsDashboard** (`ResultsDashboard.tsx`) renders the animated results
7. User can download a **PDF report** or **share the result**

> **Fallback**: If the Gemini API key isn't set, the app uses `mockEngine.ts` — a rule-based heuristic engine with keyword matching. This ensures the app always works even without an API key.

---

## 🚀 Features

| Feature | Description |
|---|---|
| **Text Analysis** | Paste any WhatsApp forward, email, or job description |
| **URL Checker** | Enter a job portal link — app scrapes and analyses the full page |
| **Image/Screenshot OCR** | Upload a pamphlet or screenshot — Gemini reads the text via Vision |
| **Trust Score (0–100%)** | Animated circular meter showing how trustworthy the job is |
| **Verdict** | Verified Legit / Needs Verification / High Risk |
| **Red Flag List** | Specific suspicious phrases highlighted with evidence |
| **Positive Signals** | Legitimate indicators found in the posting |
| **Safe Action Guidance** | Step-by-step what to do next, India-specific links |
| **PDF Report** | Downloadable report to share with family or police |
| **Copy/Share** | One-click copy of full result summary |
| **Community Scam Board** | Browse and submit crowd-sourced scam reports |
| **Mobile Responsive** | Works on phones — most scams arrive on WhatsApp |

---

## 🛠️ Tech Stack

| Technology | Why we used it |
|---|---|
| **Next.js 15** | React framework with built-in API routes — one codebase for frontend + backend |
| **TypeScript** | Type safety — catches bugs before they happen |
| **Google Gemini 2.5 Flash** | Best-in-class multimodal AI model with thinking mode |
| **@google/genai** | Official Google SDK for calling Gemini |
| **Zod** | Validates the AI's JSON response to ensure it always has the right shape |
| **jsPDF** | Generates downloadable PDF reports in the browser |
| **Lucide React** | Clean, consistent icons |
| **Vanilla CSS** | Custom dark theme, glassmorphism cards, smooth animations — no Tailwind needed |

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js 18+
- A Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
echo "GOOGLE_GEMINI_API_KEY=your_key_here" > .env.local

# 3. Run the dev server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

> **No API key?** The app still works — it uses the built-in heuristic engine (`mockEngine.ts`) as a fallback.

---

## 🇮🇳 Why This Matters

- **₹1.25 lakh crore** lost to cyber fraud in India in 2023 (RBI data)
- Job scams are the **#1 category** of cybercrime targeting youth
- Most victims are **college students and fresh graduates** — exactly our target users
- The **1930 National Cybercrime Helpline** receives thousands of job-scam complaints daily

JobShield AI gives **instant, free, AI-powered protection** to anyone with a smartphone.

---

## 📞 Emergency Resources (Built into the App)

| Resource | Contact |
|---|---|
| National Cybercrime Helpline | **1930** |
| Online Complaint Portal | [cybercrime.gov.in](https://cybercrime.gov.in) |
| Company Verification | [mca.gov.in](https://www.mca.gov.in) |
| Suspected Number Block | [sancharsaathi.gov.in](https://sancharsaathi.gov.in) |

---

*Built to protect the next generation of Indian professionals from employment fraud.*
