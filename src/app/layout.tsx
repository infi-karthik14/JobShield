import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobShield AI – Local Job Scam & Vacancy Verifier",
  description:
    "AI-powered job scam detector for college students, fresh graduates, and local job seekers in India. Verify job postings, WhatsApp forwards, and walk-in drives instantly.",
  keywords:
    "job scam detector India, fake job verification, employment fraud, WhatsApp job scam, local job verifier",
  openGraph: {
    title: "JobShield AI – Local Job Scam & Vacancy Verifier",
    description:
      "Instantly verify job postings and detect employment fraud with AI. Protect yourself from fake recruiters and registration fee scams.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
