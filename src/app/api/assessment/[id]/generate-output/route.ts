import { createAdminClient } from "@/lib/supabase/admin";
import { generateAssessmentOutput, isV2Assessment } from "@/lib/generate-output";
import type { V2Narrative } from "@/lib/generate-output";
import type { Database } from "@/types/supabase";

type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"];

export const maxDuration = 120;

function sseEvent(data: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createAdminClient();
  const { data: rowData, error: fetchError } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !rowData) {
    return new Response(JSON.stringify({ error: "Assessment not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const row = rowData as unknown as AssessmentRow;
  const narrative = row.ai_narrative;
  if (!isV2Assessment(narrative)) {
    return new Response(JSON.stringify({ error: "Not a v2 assessment" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Already generated
  if (narrative.output) {
    return new Response(JSON.stringify({ ok: true, cached: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const heartbeatComment = encoder.encode(": heartbeat\n\n");

  const stream = new ReadableStream({
    async start(controller) {
      const heartbeat = setInterval(() => {
        try { controller.enqueue(heartbeatComment); } catch { /* closed */ }
      }, 5_000);

      try {
        const output = await generateAssessmentOutput({
          path: narrative.path,
          routing_q1: narrative.routing_q1,
          routing_q2: narrative.routing_q2,
          answers: narrative.answers,
          open_text: (row as unknown as Record<string, unknown>).open_text as string | null ?? null,
        });
        clearInterval(heartbeat);

        const updated: V2Narrative = { ...narrative, output };
        const { error: updateError } = await supabase
          .from("assessments")
          .update({ ai_narrative: updated } as never)
          .eq("id", id);

        if (updateError) {
          console.error("[generate-output] DB save failed:", updateError);
          controller.enqueue(sseEvent({ done: true, error: "Failed to save output" }));
        } else {
          controller.enqueue(sseEvent({ done: true, output }));
        }
        controller.close();
      } catch (e) {
        clearInterval(heartbeat);
        const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
        console.error("[generate-output] Failed:", msg);
        try {
          controller.enqueue(sseEvent({ done: true, error: msg }));
          controller.close();
        } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
