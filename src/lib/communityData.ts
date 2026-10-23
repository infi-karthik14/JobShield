import { CommunityReport } from "@/types";

export const MOCK_REPORTS: CommunityReport[] = [
  {
    id: "r001",
    title: "Fake TCS BPO Recruitment via WhatsApp",
    description:
      "Received a WhatsApp message claiming TCS is hiring BPO executives for ₹35,000/month. Asked to pay ₹2,500 for 'ID card and welcome kit'. The number is not listed on TCS official website.",
    location: "Lucknow, UP",
    category: "BPO / Call Centre",
    reportedAt: "2026-10-20T10:30:00Z",
    upvotes: 47,
    verdict: "High Risk / Likely Scam",
    contactInfo: "+91 98XXXX1234",
    tags: ["TCS Impersonation", "WhatsApp Scam", "Registration Fee", "BPO"],
  },
  {
    id: "r002",
    title: "Data Entry Work From Home – Daily ₹800 Promise",
    description:
      "An Instagram ad promises ₹800 per day for typing work. After clicking, asks for ₹999 'software license fee' via UPI. No company name mentioned anywhere.",
    location: "Kanpur, UP",
    category: "Work From Home",
    reportedAt: "2026-10-18T14:00:00Z",
    upvotes: 63,
    verdict: "High Risk / Likely Scam",
    contactInfo: "scamjobs2026@gmail.com",
    tags: ["Data Entry Scam", "Instagram", "UPI Fraud", "WFH"],
  },
  {
    id: "r003",
    title: "Walk-In Drive Circular – Fake IT Company",
    description:
      "Walk-in drive pamphlet distributed in Sector 18, Noida for 'Infosys Digital Hub'. The CIN number on the pamphlet doesn't exist on MCA portal. Claims 200 openings.",
    location: "Noida, UP",
    category: "IT / Software",
    reportedAt: "2026-10-15T09:15:00Z",
    upvotes: 92,
    verdict: "High Risk / Likely Scam",
    tags: ["Infosys Impersonation", "Fake Walk-In", "Pamphlet Scam", "IT"],
  },
  {
    id: "r004",
    title: "Amazon Packing Job – ₹15,000/month",
    description:
      "Circular shared in college WhatsApp groups for Amazon packaging center. Asks freshers to pay ₹1,800 for 'uniform and ID'. The address given leads to a residential flat.",
    location: "Varanasi, UP",
    category: "Logistics / Warehouse",
    reportedAt: "2026-10-12T16:45:00Z",
    upvotes: 38,
    verdict: "High Risk / Likely Scam",
    contactInfo: "amazon.jobs.india@gmail.com",
    tags: ["Amazon Impersonation", "Fee Scam", "College Students", "Logistics"],
  },
  {
    id: "r005",
    title: "Myntra Fashion Associate Hiring",
    description:
      "Got a call from someone claiming to be Myntra HR. Interview conducted fully on Telegram. No joining letter provided. Asked to submit Aadhaar and bank details before joining.",
    location: "Agra, UP",
    category: "E-commerce / Retail",
    reportedAt: "2026-10-08T11:00:00Z",
    upvotes: 29,
    verdict: "Needs Verification",
    contactInfo: "myntra.hr2026@yahoo.com",
    tags: ["Myntra Impersonation", "Telegram Interview", "Data Harvesting"],
  },
  {
    id: "r006",
    title: "Genuine Wipro Off-Campus Drive – Verified",
    description:
      "Received official email from careers@wipro.com for a legitimate off-campus coding drive. No fees asked. Interview conducted on official Wipro portal. CIN verified on MCA.",
    location: "Remote / PAN India",
    category: "IT / Software",
    reportedAt: "2026-10-05T08:30:00Z",
    upvotes: 156,
    verdict: "Verified Legit",
    tags: ["Wipro", "Verified", "Off-Campus", "Official Email"],
  },
  {
    id: "r007",
    title: "Part-Time YouTube Marketing Job Scam",
    description:
      "Job claims you can earn ₹500–₹1,000 daily by subscribing to YouTube channels and completing tasks. Requires ₹500 'deposit' to activate your account. Classic advance-fee fraud.",
    location: "Prayagraj, UP",
    category: "Digital Marketing",
    reportedAt: "2026-10-01T17:20:00Z",
    upvotes: 74,
    verdict: "High Risk / Likely Scam",
    tags: ["YouTube Scam", "Advance Fee", "Task-Based Fraud", "Part-Time"],
  },
  {
    id: "r008",
    title: "Government Railway Recruitment Scam",
    description:
      "Flyer claims direct government railway recruitment without exam. Asks ₹5,000 'application processing fee'. RRB official portal has no such recruitment open.",
    location: "Gorakhpur, UP",
    category: "Government / PSU",
    reportedAt: "2026-09-28T12:00:00Z",
    upvotes: 118,
    verdict: "High Risk / Likely Scam",
    tags: ["Government Scam", "Railway", "Fake Recruitment", "Processing Fee"],
  },
];
