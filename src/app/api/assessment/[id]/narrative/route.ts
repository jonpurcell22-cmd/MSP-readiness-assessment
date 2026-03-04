import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/supabase";
import type { CompetitiveLandscapeOutput } from "@/types/competitive";

type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"];

/**
 * GET: return AI narrative content for the results page (exec summary + competitive landscape).
 * Used by the client to poll and update the two sections in place without full page refresh.
 * Returns nulls when narrative is not ready yet.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing assessment id" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("assessments")
      .select("ai_narrative")
      .eq("id", id)
      .single();

    if (error || !row) {
      return NextResponse.json(
        { error: error?.message ?? "Assessment not found" },
        { status: 404 }
      );
    }

    const narrative = (row as AssessmentRow).ai_narrative;
    const narrativeObj = narrative && typeof narrative === "object" ? (narrative as Record<string, unknown>) : null;
    const hasExecSummary = typeof narrativeObj?.executive_summary === "string" && narrativeObj.executive_summary.length > 0;
    if (!narrativeObj || !hasExecSummary) {
      return NextResponse.json({
        executiveSummary: null,
        competitiveLandscape: null,
      });
    }

    const storedCompetitive = narrativeObj.competitive_landscape as
      | CompetitiveLandscapeOutput
      | undefined;

    const competitiveLandscape =
      storedCompetitive != null
        ? {
            summary: [storedCompetitive.landscapeSummary, storedCompetitive.strategicImplication]
              .filter(Boolean)
              .join(" "),
            competitors: storedCompetitive.competitors.map((c) => ({
              company: c.name,
              strength: c.programEvidence,
              channelApproach: c.mspProgramStatus,
              opportunity: c.mspRelevantWeakness,
            })),
          }
        : null;

    return NextResponse.json({
      executiveSummary: String(narrativeObj.executive_summary),
      competitiveLandscape,
    });
  } catch (e) {
    console.error("[narrative GET] Error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
