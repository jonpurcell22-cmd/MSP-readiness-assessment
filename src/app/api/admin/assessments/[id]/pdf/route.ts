import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { renderAssessmentPDF } from "@/lib/pdf-build";
import { rowToBuildPDFPayload } from "@/lib/assessment-row-payload";
import type { Database } from "@/types/supabase";

type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"];

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
