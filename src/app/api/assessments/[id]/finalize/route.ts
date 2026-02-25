import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { renderAssessmentPDF } from "@/lib/pdf-build";
import { sendAssessmentEmails } from "@/lib/send-emails";
import { isNarrativeOutput } from "@/lib/narrative";
import type { NarrativeOutput } from "@/lib/narrative";
import { isCompetitiveLandscapeOutput } from "@/types/competitive";
import type { CompetitiveLandscapeOutput } from "@/types/competitive";
import { rowToBuildPDFPayload, rowToEmailPayload } from "@/lib/assessment-row-payload";
import type { Database } from "@/types/supabase";

type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"];

/**
 * POST body: { narrative: NarrativeOutput, competitiveLandscape?: CompetitiveLandscapeOutput }
 * Saves narrative to the assessment, generates PDF, and sends user + admin emails.
 * Called by the client after all 3 narrative parts (and optional competitive) have been merged.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing assessment id" }, { status: 400 });
    }

    const body = await request.json();
    const narrative = body?.narrative;
    if (!isNarrativeOutput(narrative)) {
      return NextResponse.json(
        { error: "Missing or invalid narrative in body" },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();
    const { data: row, error: fetchError } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !row) {
      return NextResponse.json(
        { error: fetchError?.message ?? "Assessment not found" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("assessments")
      .update({ ai_narrative: narrative } as never)
      .eq("id", id);

    if (updateError) {
      console.error("Failed to save narrative:", updateError);
      return NextResponse.json(
        { error: "Failed to save narrative" },
        { status: 500 }
      );
    }

    const competitiveLandscape = body?.competitiveLandscape;
    const pdfPayload = rowToBuildPDFPayload(row as AssessmentRow, narrative);
    if (isCompetitiveLandscapeOutput(competitiveLandscape)) {
      pdfPayload.competitiveLandscape = competitiveLandscape;
    }
    const emailPayload = rowToEmailPayload(row as AssessmentRow);

    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = await renderAssessmentPDF(pdfPayload);
    } catch (pdfErr) {
      console.error("[finalize] PDF generation failed:", pdfErr);
    }

    let emailSent = true;
    try {
      await sendAssessmentEmails({
        payload: emailPayload,
        narrative,
        pdfBuffer,
        competitiveLandscape: isCompetitiveLandscapeOutput(competitiveLandscape) ? competitiveLandscape : undefined,
      });
    } catch (emailErr) {
      console.error("[finalize] Email send failed:", emailErr);
      emailSent = false;
    }

    return NextResponse.json({ emailSent });
  } catch (e) {
    console.error("Finalize API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
