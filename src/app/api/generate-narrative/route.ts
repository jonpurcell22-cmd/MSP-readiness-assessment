import { NextResponse } from "next/server";
import { getNarrative } from "@/lib/narrative";
import { getServerSupabase } from "@/lib/supabase";
import type { SubmitPayload } from "@/app/api/submit/route";

/** POST body: full assessment payload, optional assessmentId to store narrative on that row. */
interface GenerateNarrativeBody extends SubmitPayload {
  assessmentId?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateNarrativeBody;
    const { assessmentId, ...payload } = body;

    if (!payload.contact?.email || !payload.contact?.fullName || !payload.computed) {
      return NextResponse.json(
        { error: "Missing required fields: contact (email, fullName) and computed" },
        { status: 400 }
      );
    }

    const narrative = await getNarrative(payload);

    if (assessmentId) {
      const supabase = getServerSupabase();
      const { error } = await supabase
        .from("assessments")
        .update({ ai_narrative: narrative } as never)
        .eq("id", assessmentId);
      if (error) {
        console.error("Failed to store narrative:", error);
        return NextResponse.json(
          { error: "Narrative generated but failed to save" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ narrative });
  } catch (e) {
    console.error("Generate narrative API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/** GET: return fallback narrative for the same payload shape (for testing). */
export async function GET() {
  return NextResponse.json({
    message: "Use POST with assessment payload (and optional assessmentId) to generate narrative.",
  });
}
