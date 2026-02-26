import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import type { Answers } from "@/types/assessment";

type AssessmentRow = {
  id: string;
  section_1_scores: Record<string, number> | null;
  section_2_scores: Record<string, number> | null;
  section_3_scores: Record<string, number> | null;
  section_4_scores: Record<string, number> | null;
  section_5_scores: Record<string, number> | null;
  section_6_scores: Record<string, number> | null;
  section_7_scores: Record<string, number> | null;
  section_7_skipped: boolean;
  [key: string]: unknown;
};

function rowToAnswers(row: AssessmentRow): Answers {
  const toSection = (s: Record<string, number> | null) =>
    s && typeof s.q1 === "number"
      ? {
          q1: s.q1,
          q2: s.q2 ?? 0,
          q3: s.q3 ?? 0,
          q4: s.q4 ?? 0,
          q5: s.q5 ?? 0,
        }
      : undefined;

  return {
    section1: toSection(row.section_1_scores) as Answers["section1"],
    section2: toSection(row.section_2_scores) as Answers["section2"],
    section3: toSection(row.section_3_scores) as Answers["section3"],
    section4: toSection(row.section_4_scores) as Answers["section4"],
    section5: toSection(row.section_5_scores) as Answers["section5"],
    section6: toSection(row.section_6_scores) as Answers["section6"],
    section7: toSection(row.section_7_scores) as Answers["section7"],
  };
}

/** GET: return assessment by id with answers and section_7_skipped for section/gate/financial pages. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing assessment id" }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { data: row, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !row) {
      return NextResponse.json(
        { error: error?.message ?? "Assessment not found" },
        { status: 404 }
      );
    }

    const r = row as unknown as AssessmentRow;
    const answers = rowToAnswers(r);

    return NextResponse.json({
      ...r,
      answers,
      section_7_skipped: r.section_7_skipped ?? false,
    });
  } catch (e) {
    console.error("Assessment GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/** PATCH: update answers, section_7_skipped, and optionally section_scores/total_score/tier/completed_at. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing assessment id" }, { status: 400 });
    }

    const body = (await request.json()) as {
      answers?: Answers & { financial?: Record<string, unknown> };
      section_7_skipped?: boolean;
      section_scores?: Record<string, number>;
      total_score?: number;
      tier?: string;
      completed_at?: string;
    };

    const supabase = getServerSupabase();
    const { data: existing, error: fetchError } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: fetchError?.message ?? "Assessment not found" },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (body.answers !== undefined) {
      const a = body.answers;
      if (a.section1) updates.section_1_scores = a.section1 as Record<string, number>;
      if (a.section2) updates.section_2_scores = a.section2 as Record<string, number>;
      if (a.section3) updates.section_3_scores = a.section3 as Record<string, number>;
      if (a.section4) updates.section_4_scores = a.section4 as Record<string, number>;
      if (a.section5) updates.section_5_scores = a.section5 as Record<string, number>;
      if (a.section6) updates.section_6_scores = a.section6 as Record<string, number>;
      if (a.section7) updates.section_7_scores = a.section7 as Record<string, number>;
    }

    if (typeof body.section_7_skipped === "boolean") {
      updates.section_7_skipped = body.section_7_skipped;
    }

    if (body.section_scores !== undefined) {
      const s = body.section_scores;
      if (typeof s.section1 === "number") updates.section_1_total = s.section1;
      if (typeof s.section2 === "number") updates.section_2_total = s.section2;
      if (typeof s.section3 === "number") updates.section_3_total = s.section3;
      if (typeof s.section4 === "number") updates.section_4_total = s.section4;
      if (typeof s.section5 === "number") updates.section_5_total = s.section5;
      if (typeof s.section6 === "number") updates.section_6_total = s.section6;
      if (s.section7 !== undefined && s.section7 !== null)
        updates.section_7_total = s.section7;
    }
    if (typeof body.total_score === "number") updates.overall_score = body.total_score;
    if (typeof body.tier === "string") updates.readiness_tier = body.tier;
    if (typeof body.completed_at === "string") updates.completed_at = body.completed_at;

    const { error: updateError } = await supabase
      .from("assessments")
      .update(updates as never)
      .eq("id", id);

    if (updateError) {
      console.error("Assessment PATCH error:", updateError);
      return NextResponse.json(
        { error: updateError.message ?? "Failed to update" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Assessment PATCH error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
