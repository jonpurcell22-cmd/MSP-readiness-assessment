import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendUserResultsEmail } from "@/lib/lead-notification"
import type { AssessmentScores, AssessmentOutput } from "@/types/assessment"

export async function POST(request: Request) {
  const ok = await isAdminAuthenticated()
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const id = body?.id
  if (!id) {
    return NextResponse.json({ error: "Missing assessment id" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("assessments")
    .select("id, first_name, email, scores, output")
    .eq("id", id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
  }

  const row = data as unknown as {
    id: string
    first_name: string
    email: string
    scores: AssessmentScores | null
    output: AssessmentOutput | null
  }

  if (!row.scores || !row.output) {
    return NextResponse.json(
      { error: "Assessment output not yet generated — cannot resend" },
      { status: 400 }
    )
  }

  try {
    await sendUserResultsEmail({
      assessmentId: row.id,
      firstName: row.first_name,
      email: row.email,
      maturityLabel: row.scores.maturityLabel,
      overallScore: row.scores.overall,
      priorityFocus: row.output.priority_focus,
      recommendedServiceName: row.output.recommended_service.name,
      recommendedServiceRationale: row.output.recommended_service.rationale,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[admin/resend-email] Failed:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send email" },
      { status: 500 }
    )
  }
}
