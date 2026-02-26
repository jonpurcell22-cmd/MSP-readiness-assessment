import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { sections } from "@/lib/assessment-data";
import { getTier, getTierDescription } from "@/lib/scoring";
import type { Tier } from "@/lib/scoring";
import {
  generateExecutiveSummary,
  generateSectionInterpretation,
  generateCompetitiveLandscape,
} from "@/lib/mock-ai";
import {
  calculateProjections,
} from "@/lib/financial-projections";
import type { FinancialInputs } from "@/lib/financial-projections";
import { ResultsWithAI } from "../results-with-ai";
import type { SubmitPayload } from "@/app/api/submit/route";
import type { SectionScores } from "@/types/assessment";
import type { Database } from "@/types/supabase";

type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"];

function toSectionScores(row: Record<string, number> | null): SectionScores | null {
  if (!row || typeof row.q1 !== "number") return null;
  return {
    q1: row.q1,
    q2: row.q2 ?? 0,
    q3: row.q3 ?? 0,
    q4: row.q4 ?? 0,
    q5: row.q5 ?? 0,
  };
}

function rowToNarrativePayload(row: AssessmentRow): SubmitPayload {
  return {
    contact: {
      fullName: row.full_name ?? "",
      email: row.email ?? "",
      phone: row.phone ?? "",
      title: (row.title as SubmitPayload["contact"]["title"]) ?? "",
      companyName: row.company_name ?? "",
      companyWebsite: row.company_website ?? "",
      productCategory: (row.product_category as SubmitPayload["contact"]["productCategory"]) ?? "",
    },
    financials: {
      arr: row.arr ?? null,
      acv: row.acv ?? null,
      customerCount: row.customer_count ?? null,
      directRevenuePct: row.direct_revenue_pct ?? 0,
      salesCycleDays: row.sales_cycle_days ?? null,
      cac: row.cac ?? null,
      existingMspRelationships: (row.existing_msp_relationships as SubmitPayload["financials"]["existingMspRelationships"]) ?? null,
    },
    section1: toSectionScores(row.section_1_scores),
    section2: toSectionScores(row.section_2_scores),
    section3: toSectionScores(row.section_3_scores),
    section4: toSectionScores(row.section_4_scores),
    section5: toSectionScores(row.section_5_scores),
    section6: toSectionScores(row.section_6_scores),
    section7: toSectionScores(row.section_7_scores),
    section7Skipped: row.section_7_skipped ?? false,
    computed: {
      sectionTotals: {
        section1: row.section_1_total ?? 0,
        section2: row.section_2_total ?? 0,
        section3: row.section_3_total ?? 0,
        section4: row.section_4_total ?? 0,
        section5: row.section_5_total ?? 0,
        section6: row.section_6_total ?? 0,
        section7: row.section_7_skipped ? null : (row.section_7_total ?? null),
      },
      overallScore: row.overall_score ?? 0,
      readinessTier: (row.readiness_tier as SubmitPayload["computed"]["readinessTier"]) ?? "emerging",
      redFlags: row.red_flags ?? [],
      section7Skipped: row.section_7_skipped ?? false,
    },
  };
}

/** Section totals keyed by section id (section1 .. section7). */
type SectionScoresMap = Record<string, number>;

/** Answers + optional financial for mock AI and projections. */
type AnswersMap = Record<string, unknown> & { financial?: FinancialInputs };

interface AssessmentData {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  answers: AnswersMap;
  section_scores: SectionScoresMap;
  total_score: number;
  tier: Tier;
  completed_at: string;
}

function rowToAssessmentData(row: AssessmentRow): AssessmentData {
  const section_scores: SectionScoresMap = {
    section1: row.section_1_total ?? 0,
    section2: row.section_2_total ?? 0,
    section3: row.section_3_total ?? 0,
    section4: row.section_4_total ?? 0,
    section5: row.section_5_total ?? 0,
    section6: row.section_6_total ?? 0,
    section7: row.section_7_skipped ? 0 : (row.section_7_total ?? 0),
  };
  const total_score = row.overall_score ?? 0;
  const tier = (row.readiness_tier as Tier) || getTier(total_score);
  const sectionScoresRows = [
    row.section_1_scores,
    row.section_2_scores,
    row.section_3_scores,
    row.section_4_scores,
    row.section_5_scores,
    row.section_6_scores,
    row.section_7_scores,
  ];
  const answers: AnswersMap = {
    product_category: row.product_category,
    financial: {
      current_arr: row.arr ?? 0,
      avg_contract_value: row.acv ?? 12000,
      estimated_cac: row.cac ?? 5000,
      quarterly_new_customers: 10,
    },
    section1: sectionScoresRows[0] ?? {},
    section2: sectionScoresRows[1] ?? {},
    section3: sectionScoresRows[2] ?? {},
    section4: sectionScoresRows[3] ?? {},
    section5: sectionScoresRows[4] ?? {},
    section6: sectionScoresRows[5] ?? {},
    section7: sectionScoresRows[6] ?? {},
  };
  return {
    id: row.id,
    company_name: row.company_name,
    contact_name: row.full_name,
    email: row.email,
    answers,
    section_scores,
    total_score,
    tier,
    completed_at: row.created_at ?? new Date().toISOString(),
  };
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const assessment = rowToAssessmentData(data as AssessmentRow);
  const tierDescription = getTierDescription(assessment.tier);

  const executiveSummary = generateExecutiveSummary(
    assessment.company_name,
    assessment.total_score,
    assessment.tier,
    assessment.section_scores
  );

  const sectionInterpretations: Record<string, string> = {};
  for (const section of sections) {
    sectionInterpretations[section.id] = generateSectionInterpretation(
      section.id,
      assessment.section_scores[section.id] ?? 0,
      assessment.answers
    );
  }

  const competitiveLandscape = generateCompetitiveLandscape(
    (assessment.answers.product_category as string) ?? "Technology",
    assessment.company_name
  );

  const financialInputs: FinancialInputs = assessment.answers?.financial ?? {
    current_arr: 0,
    avg_contract_value: 12000,
    estimated_cac: 5000,
    quarterly_new_customers: 10,
  };

  const projections = calculateProjections(
    financialInputs,
    assessment.total_score
  );

  const narrativePayload = rowToNarrativePayload(data as AssessmentRow);
  const competitivePayload = {
    companyName: assessment.company_name,
    productCategory: (assessment.answers.product_category as string) ?? "Technology",
    section6Total: assessment.section_scores?.section6 ?? 0,
    section6Scores: (assessment.answers.section6 as { q1: number; q2: number; q3: number; q4: number; q5: number }) ?? undefined,
  };

  return (
    <ResultsWithAI
      assessment={assessment}
      tierDescription={tierDescription}
      projections={projections}
      narrativePayload={narrativePayload}
      competitivePayload={competitivePayload}
      initialExecutiveSummary={executiveSummary}
      initialSectionInterpretations={sectionInterpretations}
      initialCompetitiveLandscape={competitiveLandscape}
    />
  );
}
