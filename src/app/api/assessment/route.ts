import { NextResponse, after } from "next/server"
import { getServerSupabase } from "@/lib/supabase"
import { sendLeadNotificationEmail, sendUserResultsEmail } from "@/lib/lead-notification"
import { generateAssessmentOutput } from "@/lib/generate-output"
import {
  calculateRawScore,
  rescaleScore,
  getMaturityLabel,
  calculateDimensionScore,
  recommendService,
} from "@/data/questions"
import type { AssessmentContact, AssessmentAnswers, AssessmentScores } from "@/types/assessment"

interface PostBody {
  contact: AssessmentContact
  answers: AssessmentAnswers
  points: Record<string, number>
}

/** POST: create a new assessment; returns { id }. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PostBody

    if (!body.contact?.firstName?.trim() || !body.contact?.lastName?.trim() || !body.contact?.email?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, email" },
        { status: 400 }
      )
    }

    let supabase
    try {
      supabase = getServerSupabase()
    } catch (e) {
      console.error("Supabase config error:", e)
      return NextResponse.json(
        { error: "Server is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env." },
        { status: 503 }
      )
    }

    // Recalculate scores server-side -- do not trust client scores
    const raw = calculateRawScore(body.points)
    const overall = rescaleScore(raw)
    const arch = calculateDimensionScore(body.points, "arch")
    const gtm = calculateDimensionScore(body.points, "gtm")
    const px = calculateDimensionScore(body.points, "px")
    const maturityLabel = getMaturityLabel(overall)

    const scores: AssessmentScores = { overall, arch, gtm, px, maturityLabel }

    const row = {
      first_name: body.contact.firstName.trim(),
      last_name: body.contact.lastName.trim(),
      email: body.contact.email.trim(),
      vertical: body.contact.vertical ?? null,
      company_size: body.contact.companySize ?? null,
      answers: body.answers,
      scores,
      output: null,
    }

    const { data: rawData, error } = await supabase
      .from("assessments")
      .insert(row as never)
      .select("id, created_at")
      .single()

    const data = rawData as { id: string; created_at: string } | null

    if (error || !data) {
      console.error("Assessment create error:", error)
      return NextResponse.json(
        { error: error?.message ?? "Failed to create assessment" },
        { status: 500 }
      )
    }

    // Use after() so Vercel keeps the function alive after the response is sent.
    // Without this, fire-and-forget promises get killed when the serverless
    // function terminates on response.
    const firstName = body.contact.firstName.trim()
    const emailAddr = body.contact.email.trim()
    const assessmentId = data.id

    after(async () => {
      // Notify admin of new lead
      try {
        await sendLeadNotificationEmail({
          assessmentId,
          fullName: `${firstName} ${body.contact.lastName.trim()}`,
          email: emailAddr,
          companyName: "",
        })
      } catch (err) {
        console.error("[assessment] Admin email failed:", err)
      }

      // Generate output + send results email
      try {
        const service = recommendService(body.points, scores)
        const output = await generateAssessmentOutput(
          firstName,
          scores,
          body.answers,
          service,
          body.contact.vertical ?? undefined,
          body.contact.companySize ?? undefined,
        )

        // Save output to DB
        const sb = getServerSupabase()
        await sb
          .from("assessments")
          .update({ output } as never)
          .eq("id", assessmentId)

        // Send results email
        await sendUserResultsEmail({
          assessmentId,
          firstName,
          email: emailAddr,
          maturityLabel: scores.maturityLabel,
          overallScore: scores.overall,
          priorityFocus: output.priority_focus,
          recommendedServiceName: output.recommended_service.name,
          recommendedServiceRationale: output.recommended_service.rationale,
        })
      } catch (err) {
        console.error("[assessment] Output generation / results email failed:", err)
      }
    })

    return NextResponse.json({ id: data.id })
  } catch (e) {
    console.error("Assessment API error:", e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    )
  }
}
