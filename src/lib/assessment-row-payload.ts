/**
 * Build PDF and email payloads from an assessment row (e.g. after loading from Supabase).
 * Used by admin PDF route and by finalize route.
 */

import { generateFallbackNarrative, isNarrativeOutput } from "@/lib/narrative";
import type { NarrativeOutput } from "@/lib/narrative";
import type { BuildPDFPayload } from "@/lib/pdf-build";
import type { SectionScores } from "@/types/assessment";
import type { Database } from "@/types/supabase";
import type { AssessmentEmailPayload } from "@/lib/send-emails";

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

/**
 * Build payload for PDF generation from a row.
 * When narrativeOverride is provided (e.g. from client-merged parts), use it; otherwise use row.ai_narrative or fallback.
 */
export function rowToBuildPDFPayload(
  row: AssessmentRow,
  narrativeOverride?: NarrativeOutput
): BuildPDFPayload {
  const narrative: NarrativeOutput =
    narrativeOverride ??
    (isNarrativeOutput(row.ai_narrative)
      ? row.ai_narrative
      : generateFallbackNarrative({
          contact: { companyName: row.company_name, productCategory: row.product_category as never },
          computed: {
            overallScore: row.overall_score ?? 0,
            readinessTier: (row.readiness_tier as "ready" | "capable" | "emerging" | "premature") ?? "emerging",
            sectionTotals: {
              section1: row.section_1_total ?? 0,
              section2: row.section_2_total ?? 0,
              section3: row.section_3_total ?? 0,
              section4: row.section_4_total ?? 0,
              section5: row.section_5_total ?? 0,
              section6: row.section_6_total ?? 0,
              section7: row.section_7_total ?? null,
            },
            redFlags: row.red_flags ?? [],
            section7Skipped: row.section_7_skipped ?? true,
          },
          financials: {
            arr: row.arr,
            acv: row.acv,
            productCategory: row.product_category,
          },
        }));

  return {
    contact: { companyName: row.company_name },
    financials: {
      arr: row.arr,
      acv: row.acv,
      customerCount: row.customer_count ?? null,
      cac: row.cac,
      salesCycleDays: row.sales_cycle_days,
    },
    computed: {
      overallScore: row.overall_score ?? 0,
      readinessTier: (row.readiness_tier as "ready" | "capable" | "emerging" | "premature") ?? "emerging",
      sectionTotals: {
        section1: row.section_1_total ?? 0,
        section2: row.section_2_total ?? 0,
        section3: row.section_3_total ?? 0,
        section4: row.section_4_total ?? 0,
        section5: row.section_5_total ?? 0,
        section6: row.section_6_total ?? 0,
        section7: row.section_7_total ?? null,
      },
      section7Skipped: row.section_7_skipped ?? true,
      redFlags: row.red_flags ?? [],
    },
    narrative,
    section1: toSectionScores(row.section_1_scores),
    section2: toSectionScores(row.section_2_scores),
    section3: toSectionScores(row.section_3_scores),
    section4: toSectionScores(row.section_4_scores),
    section5: toSectionScores(row.section_5_scores),
    section6: toSectionScores(row.section_6_scores),
    section7: toSectionScores(row.section_7_scores),
  };
}

/** Build email payload from a row (contact, financials, computed). */
export function rowToEmailPayload(row: AssessmentRow): AssessmentEmailPayload {
  return {
    contact: {
      fullName: row.full_name,
      email: row.email,
      phone: row.phone ?? "",
      title: row.title ?? "",
      companyName: row.company_name,
      companyWebsite: row.company_website ?? "",
      productCategory: row.product_category ?? "",
    },
    financials: {
      arr: row.arr,
      acv: row.acv,
      customerCount: row.customer_count ?? null,
      directRevenuePct: row.direct_revenue_pct ?? null,
      salesCycleDays: row.sales_cycle_days ?? null,
      cac: row.cac ?? null,
      existingMspRelationships: row.existing_msp_relationships ?? null,
    },
    computed: {
      overallScore: row.overall_score ?? 0,
      readinessTier: (row.readiness_tier as "ready" | "capable" | "emerging" | "premature") ?? "emerging",
      sectionTotals: {
        section1: row.section_1_total ?? 0,
        section2: row.section_2_total ?? 0,
        section3: row.section_3_total ?? 0,
        section4: row.section_4_total ?? 0,
        section5: row.section_5_total ?? 0,
        section6: row.section_6_total ?? 0,
        section7: row.section_7_total ?? null,
      },
      redFlags: row.red_flags ?? [],
      section7Skipped: row.section_7_skipped ?? true,
    },
  };
}
