import { NextResponse } from "next/server";
import { sendAssessmentEmails } from "@/lib/send-emails";
import { renderAssessmentPDF } from "@/lib/pdf-build";
import type { SubmitPayload } from "@/app/api/submit/route";
import type { NarrativeOutput } from "@/lib/narrative";

/** POST body: full assessment payload + narrative. Generates PDF and sends both emails. */
interface SendEmailsBody extends SubmitPayload {
  narrative: NarrativeOutput;
}

export async function POST(request: Request) {
  console.log("Email API route hit");
  try {
    const body = (await request.json()) as SendEmailsBody;

    if (!body.contact?.email || !body.contact?.fullName || !body.computed || !body.narrative?.executive_summary) {
      return NextResponse.json(
        { error: "Missing required fields: contact (email, fullName), computed, and narrative" },
        { status: 400 }
      );
    }

    const pdfBuffer = await renderAssessmentPDF(body);
    const result = await sendAssessmentEmails({
      payload: body,
      narrative: body.narrative,
      pdfBuffer,
    });

    return NextResponse.json({
      ok: true,
      userId: result.userId,
      adminId: result.adminId,
    });
  } catch (e) {
    console.error("Send emails error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST with assessment payload and narrative to send user and admin emails.",
  });
}
