import { NextRequest, NextResponse } from "next/server";
import { MOCK_REPORTS } from "@/lib/communityData";
import { CommunityReport } from "@/types";

// In-memory store for new reports submitted during the session
const sessionReports: CommunityReport[] = [];

// BUG-03 fix: track upvote overrides for mock reports separately
// so we never mutate the shared MOCK_REPORTS module-level import
const mockUpvoteOverrides = new Map<string, number>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const verdict = searchParams.get("verdict");
  const search = searchParams.get("search")?.toLowerCase();

  // BUG-03 fix: apply upvote overrides to mock reports before merging
  const mockReportsWithOverrides = MOCK_REPORTS.map((r) =>
    mockUpvoteOverrides.has(r.id)
      ? { ...r, upvotes: mockUpvoteOverrides.get(r.id)! }
      : r
  );

  let reports = [...sessionReports, ...mockReportsWithOverrides];

  if (category && category !== "all") {
    reports = reports.filter((r) => r.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (verdict && verdict !== "all") {
    reports = reports.filter((r) => r.verdict === verdict);
  }

  if (search) {
    reports = reports.filter(
      (r) =>
        r.title.toLowerCase().includes(search) ||
        r.description.toLowerCase().includes(search) ||
        r.location.toLowerCase().includes(search) ||
        r.tags.some((t) => t.toLowerCase().includes(search))
    );
  }

  // Sort by upvotes desc, then by date desc
  reports.sort((a, b) => {
    if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });

  return NextResponse.json({ reports, total: reports.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, location, category, contactInfo, verdict, tags } = body;

    if (!title || !description || !location || !category) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const newReport: CommunityReport = {
      id: `session-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      category: category.trim(),
      contactInfo: contactInfo?.trim() || undefined,
      verdict: verdict || "Needs Verification",
      tags: Array.isArray(tags) ? tags : [],
      reportedAt: new Date().toISOString(),
      upvotes: 0,
    };

    sessionReports.unshift(newReport);

    return NextResponse.json({ success: true, report: newReport }, { status: 201 });
  } catch (error) {
    console.error("Community reports POST error:", error);
    return NextResponse.json({ error: "Failed to submit report." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    // Check session reports first (mutable)
    const sessionReport = sessionReports.find((r) => r.id === id);
    if (sessionReport) {
      sessionReport.upvotes += 1;
      return NextResponse.json({ success: true, upvotes: sessionReport.upvotes });
    }

    // BUG-03 fix: for mock reports, use the override map instead of mutating MOCK_REPORTS
    const mockReport = MOCK_REPORTS.find((r) => r.id === id);
    if (mockReport) {
      const current = mockUpvoteOverrides.get(id) ?? mockReport.upvotes;
      const next = current + 1;
      mockUpvoteOverrides.set(id, next);
      return NextResponse.json({ success: true, upvotes: next });
    }

    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  } catch (error) {
    console.error("Community reports PATCH error:", error);
    return NextResponse.json({ error: "Failed to upvote." }, { status: 500 });
  }
}
