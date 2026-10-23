export interface VerificationResult {
  trustScore: number;
  verdict: "Verified Legit" | "Needs Verification" | "High Risk / Likely Scam";
  summary: string;
  redFlags: string[];
  positiveSignals: string[];
  recommendations: string[];
  employerChecks?: EmployerCheck[];
  analysedAt?: string;
  inputType?: "text" | "url" | "image";
  inputPreview?: string;
}

export interface EmployerCheck {
  label: string;
  status: "pass" | "fail" | "warn" | "unknown";
  detail: string;
}

export interface CommunityReport {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  reportedAt: string;
  upvotes: number;
  verdict: "High Risk / Likely Scam" | "Needs Verification" | "Verified Legit";
  contactInfo?: string;
  tags: string[];
}
