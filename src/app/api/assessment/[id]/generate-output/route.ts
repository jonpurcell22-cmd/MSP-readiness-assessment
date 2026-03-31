import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateAssessmentOutput } from "@/lib/generate-output"
import { recommendService } from "@/data/questions"
import type { AssessmentAnswers, AssessmentScores, AssessmentOutput } from "@/types/assessment"

export const maxDuration = 120

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  console.log("[generate-output] hit, id:", id)

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: rawData, error: fetchError } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError || !rawData) {
    console.error("[generate-output] fetch error:", fetchError)
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
  }

  const assessment = rawData as unknown as {
    first_name: string
    email: string
    scores: AssessmentScores | null
    answers: AssessmentAnswers | null
    vertical: string | null
    company_size: string | null
    output: AssessmentOutput | null
  }

  console.log("[generate-output] assessment found:", {
    first_name: assessment.first_name,
    has_scores: !!assessment.scores,
    has_answers: !!assessment.answers,
    has_output: !!assessment.output,
    scores_overall: assessment.scores?.overall,
  })

  // Return cached output if exists
  if (assessment.output) {
    console.log("[generate-output] returning cached output")
    return NextResponse.json({ output: assessment.output })
  }

  if (!assessment.scores || !assessment.answers) {
    console.error("[generate-output] incomplete data -- scores:", assessment.scores, "answers:", assessment.answers)
    return NextResponse.json({ error: "Assessment data incomplete" }, { status: 400 })
  }

  // Generate
  console.log("[generate-output] calling Claude...")
  try {
    const points = Object.fromEntries(
      Object.entries(assessment.answers).map(([k, v]) => [k, Number(v)])
    )
    const service = recommendService(points, assessment.scores)
    const output = await generateAssessmentOutput(
      assessment.first_name,
      assessment.scores,
      assessment.answers,
      service,
      assessment.vertical ?? undefined,
      assessment.company_size ?? undefined
    )
    console.log("[generate-output] Claude returned:", JSON.stringify(output).slice(0, 100))

    // Save to Supabase
    const { error: updateError } = await supabase
      .from("assessments")
      .update({ output } as never)
      .eq("id", id)

    if (updateError) {
      console.error("[generate-output] DB save failed:", updateError)
      return NextResponse.json({ error: "Failed to save output" }, { status: 500 })
    }

    // Results email is now sent from /api/assessment after generation completes.

    console.log("[generate-output] saved and returning output")
    return NextResponse.json({ output })
  } catch (err) {
    console.error("[generate-output] Claude call failed:", err)
    return NextResponse.json(
      { error: err instanceof Error ? `${err.name}: ${err.message}` : String(err) },
      { status: 500 }
    )
  }
}
