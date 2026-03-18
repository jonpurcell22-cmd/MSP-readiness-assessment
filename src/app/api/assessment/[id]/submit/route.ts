import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { V2AssessmentData, V2Narrative } from "@/lib/generate-output";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let body: V2AssessmentData & { open_text?: string | null };
  try {
    body = (await request.json()) as V2AssessmentData & { open_text?: string | null };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.path || !body.routing_q1 || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const narrative: V2Narrative = {
    v: 2,
    path: body.path,
    routing_q1: body.routing_q1,
    routing_q2: body.routing_q2 ?? null,
    answers: body.answers,
  };

  const openText = typeof body.open_text === "string" && body.open_text.trim()
    ? body.open_text.trim()
    : null;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("assessments")
    .update({
      readiness_tier: body.path,
      ai_narrative: narrative,
      open_text: openText,
      completed_at: new Date().toISOString(),
    } as never)
    .eq("id", id);

  if (error) {
    console.error("[submit] DB update failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
