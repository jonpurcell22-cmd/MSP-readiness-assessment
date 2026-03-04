import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { getNarrativeParallel } from "@/lib/narrative";
import { rowToSubmitPayload } from "@/lib/assessment-row-payload";
import type { Database } from "@/types/supabase";
import type { CompetitiveLandscapeOutput } from "@/types/competitive";

export const maxDuration = 60;

type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"];

/**
 * POST: generate AI narrative from assessment row and save. Returns when narrative is saved.
 * Competitive analysis is started in the background and saved when ready (no wait).
 * Called by the results page when ai_narrative is null so the page can load fast and show AI when ready.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing assessment id" }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { data: row, error: fetchError } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !row) {
      return NextResponse.json(
        { error: fetchError?.message ?? "Assessment not found" },
        { status: 404 }
      );
    }

    const assessmentRow = row as AssessmentRow;
    const payload = rowToSubmitPayload(assessmentRow);
    const narrative = await getNarrativeParallel(payload);

    const { error: updateError } = await supabase
      .from("assessments")
      .update({ ai_narrative: narrative } as never)
      .eq("id", id);

    if (updateError) {
      console.error("[generate-narrative] Failed to save:", updateError);
      return NextResponse.json(
        { error: "Failed to save narrative" },
        { status: 500 }
      );
    }

    // Fire-and-forget: generate competitive and merge into narrative when done (do not block response)
    const base =
      process.env.VERCEL_URL != null
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    void (async () => {
      try {
        const compRes = await fetch(`${base}/api/generate-competitive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: assessmentRow.company_name,
            companyWebsite: assessmentRow.company_website ?? undefined,
            productCategory: assessmentRow.product_category,
            section6Total: assessmentRow.section_6_total ?? 0,
            section6Scores: assessmentRow.section_6_scores
              ? {
                  q1: assessmentRow.section_6_scores.q1,
                  q2: assessmentRow.section_6_scores.q2,
                  q3: assessmentRow.section_6_scores.q3,
                  q4: assessmentRow.section_6_scores.q4,
                  q5: assessmentRow.section_6_scores.q5,
                }
              : undefined,
          }),
        });
        if (compRes.ok) {
          const competitiveLandscape = (await compRes.json()) as CompetitiveLandscapeOutput;
          const merged = { ...narrative, competitive_landscape: competitiveLandscape };
          await supabase
            .from("assessments")
            .update({ ai_narrative: merged } as never)
            .eq("id", id);
        }
      } catch (e) {
        console.error("[generate-narrative] Background competitive failed:", e);
      }
    })();

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[generate-narrative] Error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed" },
      { status: 500 }
    );
  }
}
