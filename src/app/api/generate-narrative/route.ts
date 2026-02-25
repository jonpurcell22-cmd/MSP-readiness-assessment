import { NextResponse } from "next/server";
import {
  getNarrative,
  getNarrativePart1,
  getNarrativePart2,
  getNarrativePart3,
} from "@/lib/narrative";
import { getServerSupabase } from "@/lib/supabase";
import type { SubmitPayload } from "@/app/api/submit/route";

/** POST body: full assessment payload, optional part 1|2|3, optional assessmentId (for full narrative save). */
interface GenerateNarrativeBody extends SubmitPayload {
  assessmentId?: string;
  part?: 1 | 2 | 3;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateNarrativeBody;
    const { assessmentId, part, ...payload } = body;

    if (!payload.contact?.email || !payload.contact?.fullName || !payload.computed) {
      return NextResponse.json(
        { error: "Missing required fields: contact (email, fullName) and computed" },
        { status: 400 }
      );
    }

    if (part === 1) {
      const part1 = await getNarrativePart1(payload);
      return NextResponse.json(part1);
    }
    if (part === 2) {
      const part2 = await getNarrativePart2(payload);
      return NextResponse.json(part2);
    }
    if (part === 3) {
      const part3 = await getNarrativePart3(payload);
      return NextResponse.json(part3);
    }

    // Full narrative (legacy / when merging on server not needed)
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
