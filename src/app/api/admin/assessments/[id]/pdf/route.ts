import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { renderAssessmentPDF } from "@/lib/pdf-build";
import { generateFallbackNarrative, isNarrativeOutput } from "@/lib/narrative";
import type { NarrativeOutput } from "@/lib/narrative";
import type { BuildPDFPayload } from "@/lib/pdf-build";
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

function rowToBuildPDFPayload(row: AssessmentRow): BuildPDFPayload {
  const narrative: NarrativeOutput = isNarrativeOutput(row.ai_narrative)
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
        });

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing assessment id" }, { status: 400 });
  }

  const supabase = getServerSupabase();
  const { data: row, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !row) {
    return NextResponse.json(
      { error: error?.message ?? "Assessment not found" },
      { status: 404 }
    );
  }

  try {
    const payload = rowToBuildPDFPayload(row as AssessmentRow);
    const buffer = await renderAssessmentPDF(payload);
    const filename = `MSP-Readiness-${payload.contact.companyName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("Admin PDF generation error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
