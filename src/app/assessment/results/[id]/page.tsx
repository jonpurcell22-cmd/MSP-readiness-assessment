import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { sections } from "@/lib/assessment-data"
import { getTier, getTierDescription } from "@/lib/scoring"
import type { Tier } from "@/lib/scoring"
import type { SectionTotals, Answers } from "@/types/assessment"
import {
  generateExecutiveSummary,
  generateSectionInterpretation,
  generateCompetitiveLandscape,
} from "@/lib/mock-ai"
import {
  calculateProjections,
} from "@/lib/financial-projections"
import type { FinancialInputs } from "@/lib/financial-projections"
import { ResultsContent } from "./results-content"
import type { Database } from "@/types/supabase"

type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"]

interface AssessmentData {
  id: string
  company_name: string
  contact_name: string
  email: string
  answers: Answers & { financial?: FinancialInputs }
  section_scores: SectionTotals
  total_score: number
  tier: Tier
  completed_at?: string
}

/** Map DB row (snake_case, section_*_total) to results page shape (section_scores, total_score, tier). */
function rowToAssessmentData(row: AssessmentRow): AssessmentData {
  const total_score = row.overall_score ?? 0
  const tier = (row.readiness_tier as Tier) || getTier(total_score)
  const section_scores: SectionTotals = {
    section1: row.section_1_total ?? 0,
    section2: row.section_2_total ?? 0,
    section3: row.section_3_total ?? 0,
    section4: row.section_4_total ?? 0,
    section5: row.section_5_total ?? 0,
    section6: row.section_6_total ?? 0,
    section7: row.section_7_total ?? null,
  }
  return {
    id: row.id,
    company_name: row.company_name,
    contact_name: row.full_name,
    email: row.email,
    answers: {},
    section_scores,
    total_score,
    tier,
    completed_at: row.completed_at ?? undefined,
  }
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    notFound()
  }

  const row = data as AssessmentRow
  const assessment = rowToAssessmentData(row)
  const tier = assessment.tier
  const tierDescription = getTierDescription(tier)

  // Generate mock AI content (section_scores is SectionTotals, compatible with Record<string, number>)
  const executiveSummary = generateExecutiveSummary(
    assessment.company_name,
    assessment.total_score,
    tier,
    assessment.section_scores as unknown as Record<string, number>
  )

  const sectionInterpretations: Record<string, string> = {}
  for (const section of sections) {
    sectionInterpretations[section.id] = generateSectionInterpretation(
      section.id,
      assessment.section_scores?.[section.id] || 0,
      assessment.answers
    )
  }

  const competitiveLandscapeText = generateCompetitiveLandscape(
    (assessment.answers as Record<string, unknown>)?.product_category as string ||
      "Technology",
    assessment.company_name
  )
  const competitiveLandscape = { summary: competitiveLandscapeText, competitors: [] }

  // Financial projections
  const financialInputs: FinancialInputs = assessment.answers?.financial || {
    current_arr: 0,
    avg_contract_value: 12000,
    estimated_cac: 5000,
    annual_new_customers: 40,
  }

  const projections = calculateProjections(
    financialInputs,
    assessment.total_score
  )

  return (
    <ResultsContent
      assessment={assessment}
      tier={tier}
      tierDescription={tierDescription}
      executiveSummary={executiveSummary}
      sectionInterpretations={sectionInterpretations}
      competitiveLandscape={competitiveLandscape}
      projections={projections}
    />
  )
}
