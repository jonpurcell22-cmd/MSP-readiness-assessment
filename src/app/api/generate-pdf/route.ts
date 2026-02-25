import { NextResponse } from "next/server";
import { renderAssessmentPDF } from "@/lib/pdf-build";
import type { SubmitPayload } from "@/app/api/submit/route";
import type { NarrativeOutput } from "@/lib/narrative";

/** POST body: full assessment payload + narrative (same shape as submit response with narrative). */
interface GeneratePDFBody extends SubmitPayload {
  narrative: NarrativeOutput;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GeneratePDFBody;

    if (!body.contact?.companyName || !body.computed || !body.narrative?.executive_summary) {
      return NextResponse.json(
        { error: "Missing required fields: contact.companyName, computed, and narrative" },
        { status: 400 }
      );
    }

    const buffer = await renderAssessmentPDF(body);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="MSP-Readiness-${body.contact.companyName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf"`,
      },
    });
  } catch (e) {
    console.error("Generate PDF error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST with assessment payload and narrative to generate PDF.",
  });
}
