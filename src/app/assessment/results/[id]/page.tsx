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
  formatCurrency,
} from "@/lib/financial-projections"
import type { FinancialInputs } from "@/lib/financial-projections"
import { ResultsContent } from "./results-content"

interface AssessmentData {
  id: string
  company_name: string
  contact_name: string
  email: string
  answers: Answers & { financial?: FinancialInputs }
  section_scores: SectionTotals
  total_score: number
  tier: Tier
  completed_at: string
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

  const assessment = data as unknown as AssessmentData
  const tier = (assessment.tier as Tier) || getTier(assessment.total_score || 0)
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
    quarterly_new_customers: 10,
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
