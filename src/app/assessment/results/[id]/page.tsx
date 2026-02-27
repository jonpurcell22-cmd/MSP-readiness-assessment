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
  getMockCompetitors,
} from "@/lib/mock-ai"
import { calculateProjections } from "@/lib/financial-projections"
import type { FinancialInputs } from "@/lib/financial-projections"
import { getCostOfDelay, getDiyExpertEstimates } from "@/lib/pdf-financials"
import { isNarrativeOutput } from "@/lib/narrative"
import { ResultsContent } from "./results-content"
import type { ResultsProjections } from "./results-content"
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

/** Map DB row (snake_case, section_*_total) to results page shape (section_scores, total_score, tier, answers). */
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
  const answers: AssessmentData["answers"] = {
    product_category: row.product_category,
    financial: {
      current_arr: row.arr ?? undefined,
      avg_contract_value: row.acv ?? undefined,
      estimated_cac: row.cac ?? undefined,
      annual_new_customers: row.customer_count ?? undefined,
    },
  }
  if (row.section_1_scores) (answers as Record<string, unknown>).section1 = row.section_1_scores
  if (row.section_2_scores) (answers as Record<string, unknown>).section2 = row.section_2_scores
  if (row.section_3_scores) (answers as Record<string, unknown>).section3 = row.section_3_scores
  if (row.section_4_scores) (answers as Record<string, unknown>).section4 = row.section_4_scores
  if (row.section_5_scores) (answers as Record<string, unknown>).section5 = row.section_5_scores
  if (row.section_6_scores) (answers as Record<string, unknown>).section6 = row.section_6_scores
  if (row.section_7_scores) (answers as Record<string, unknown>).section7 = row.section_7_scores
  return {
    id: row.id,
    company_name: row.company_name,
    contact_name: row.full_name,
    email: row.email,
    answers,
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
  const productCategory = (assessment.answers as Record<string, unknown>)?.product_category as string || "Technology"

  // Executive summary: use stored AI narrative when present
  const narrative = row.ai_narrative
  const executiveSummary =
    isNarrativeOutput(narrative)
      ? narrative.executive_summary
      : generateExecutiveSummary(
          assessment.company_name,
          assessment.total_score,
          tier,
          assessment.section_scores as unknown as Record<string, number>
        )

  // Section interpretations: use AI narrative when present, else mock
  const sectionInterpretations: Record<string, string> = {}
  if (isNarrativeOutput(narrative) && narrative.section_interpretations?.length) {
    for (const interp of narrative.section_interpretations) {
      const sectionId = `section${interp.section_number}` as keyof typeof sectionInterpretations
      sectionInterpretations[sectionId] = [interp.interpretation, interp.recommendation].filter(Boolean).join(" ")
    }
  }
  for (const section of sections) {
    if (!sectionInterpretations[section.id]) {
      sectionInterpretations[section.id] = generateSectionInterpretation(
        section.id,
        assessment.section_scores?.[section.id] || 0,
        assessment.answers
      )
    }
  }

  const competitiveLandscapeText = generateCompetitiveLandscape(productCategory, assessment.company_name)
  const competitiveLandscape = {
    summary: competitiveLandscapeText,
    competitors: getMockCompetitors(productCategory),
  }

  // Financial projections (for 3-year table)
  const financialInputs: FinancialInputs = assessment.answers?.financial || {
    current_arr: 0,
    avg_contract_value: 12000,
    estimated_cac: 5000,
    annual_new_customers: 40,
  }
  const projectionsBase = calculateProjections(financialInputs, assessment.total_score)

  // Cost of delay and DIY/Expert (from pdf-financials for consistency with PDF)
  const pdfFinancialInputs = {
    arr: row.arr,
    acv: row.acv,
    customerCount: row.customer_count,
    cac: row.cac,
    salesCycleDays: row.sales_cycle_days,
  }
  const costOfDelayData = getCostOfDelay(pdfFinancialInputs)
  const costOfDelayPerQuarter =
    costOfDelayData != null
      ? costOfDelayData.cacSavingsPerQuarter + costOfDelayData.year1MspRevenueLost / 4
      : 0
  const { diy, expert } = getDiyExpertEstimates()

  const projections: ResultsProjections = {
    ...projectionsBase,
    costOfDelay: Math.round(costOfDelayPerQuarter),
    diyEstimate: diy,
    expertEstimate: expert,
  }

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
