import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase"
import { sendLeadNotificationEmail } from "@/lib/lead-notification"
import {
  calculateRawScore,
  rescaleScore,
  getMaturityLabel,
  calculateDimensionScore,
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

    // Fire-and-forget: notify admin of new lead
    void sendLeadNotificationEmail({
      assessmentId: data.id,
      fullName: `${body.contact.firstName.trim()} ${body.contact.lastName.trim()}`,
      email: body.contact.email.trim(),
      companyName: "",
    }).catch(() => {})

    return NextResponse.json({ id: data.id })
  } catch (e) {
    console.error("Assessment API error:", e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    )
  }
}
