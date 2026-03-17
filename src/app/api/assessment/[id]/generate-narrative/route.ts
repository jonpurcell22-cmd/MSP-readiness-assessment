import { getServerSupabase } from "@/lib/supabase";
import { getNarrativeParallel, isNarrativeOutput } from "@/lib/narrative";
import { rowToSubmitPayload } from "@/lib/assessment-row-payload";
import type { Database } from "@/types/supabase";
import type { CompetitiveLandscapeOutput } from "@/types/competitive";

export const maxDuration = 120;

type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"];

function sseEvent(data: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * POST: generate AI narrative, streaming an SSE response so the HTTP connection
 * stays open while Claude runs. Sends ": heartbeat" comments every 5s to keep
 * proxies from closing the connection. Sends "data: {done:true}" when complete.
 *
 * The client reads this stream instead of polling, so there's no client-side
 * timeout that fires before generation finishes.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing assessment id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let supabase;
  try {
    supabase = getServerSupabase();
  } catch (e) {
    console.error("[generate-narrative] Supabase config error:", e);
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: row, error: fetchError } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !row) {
    return new Response(
      JSON.stringify({ error: fetchError?.message ?? "Assessment not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const assessmentRow = row as AssessmentRow;

  // Already generated — no need to stream, respond immediately
  if (isNarrativeOutput(assessmentRow.ai_narrative)) {
    return new Response(JSON.stringify({ ok: true, cached: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(
    `[generate-narrative] Starting SSE stream for id=${id} company="${assessmentRow.company_name}" apiKeySet=${!!process.env.ANTHROPIC_API_KEY}`
  );

  const encoder = new TextEncoder();
  const heartbeatComment = encoder.encode(": heartbeat\n\n");

  const base =
    process.env.VERCEL_URL != null
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const stream = new ReadableStream({
    async start(controller) {
      // Heartbeat every 5s: keeps Vercel/proxies from closing the idle connection
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(heartbeatComment);
        } catch {
          // Controller already closed
        }
      }, 5_000);

      try {
        const payload = rowToSubmitPayload(assessmentRow);
        const t0 = Date.now();

        // Run narrative and competitive analysis in parallel so both finish before
        // the stream closes. Vercel kills the function once the response ends, so
        // fire-and-forget after controller.close() never completes.
        const [narrativeResult, compResult] = await Promise.allSettled([
          getNarrativeParallel(payload),
          fetch(`${base}/api/generate-competitive`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: assessmentRow.company_name,
              companyWebsite: assessmentRow.company_website ?? undefined,
              productCategory: assessmentRow.product_category,
              section6Total: assessmentRow.section_6_total ?? 0,
              section6Scores: assessmentRow.section_6_scores
                ? {
                    q1: assessmentRow.section_6_scores.q1,
                    q2: assessmentRow.section_6_scores.q2,
                    q3: assessmentRow.section_6_scores.q3,
                    q4: assessmentRow.section_6_scores.q4,
                    q5: assessmentRow.section_6_scores.q5,
                  }
                : undefined,
            }),
          }).then((r) =>
            r.ok
              ? (r.json() as Promise<CompetitiveLandscapeOutput>)
              : Promise.reject(new Error(`competitive HTTP ${r.status}`))
          ),
        ]);

        const elapsed = Date.now() - t0;
        clearInterval(heartbeat);

        if (narrativeResult.status === "rejected") {
          throw narrativeResult.reason;
        }

        const narrative = narrativeResult.value;
        console.log(
          `[generate-narrative] completed in ${elapsed}ms ai_generated=${!!narrative.ai_generated}`
        );

        if (!narrative.ai_generated) {
          console.warn("[generate-narrative] Fallback narrative (Claude failed), skipping DB save.");
          controller.enqueue(sseEvent({ done: true, ai_generated: false }));
          controller.close();
          return;
        }

        if (compResult.status === "rejected") {
          console.error("[generate-narrative] Competitive analysis failed:", compResult.reason);
        } else {
          console.log("[generate-narrative] Competitive analysis succeeded.");
        }

        // Merge competitive landscape into narrative if available
        const finalNarrative =
          compResult.status === "fulfilled" && compResult.value
            ? { ...narrative, competitive_landscape: compResult.value }
            : narrative;

        const { error: updateError } = await supabase
          .from("assessments")
          .update({ ai_narrative: finalNarrative } as never)
          .eq("id", id);

        if (updateError) {
          console.error("[generate-narrative] Failed to save narrative:", updateError);
          controller.enqueue(sseEvent({ done: true, error: "Failed to save narrative" }));
          controller.close();
          return;
        }

        controller.enqueue(sseEvent({ done: true, ai_generated: true }));
        controller.close();
      } catch (e) {
        clearInterval(heartbeat);
        const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
        console.error("[generate-narrative] Generation failed:", msg);
        try {
          controller.enqueue(sseEvent({ done: true, error: msg }));
          controller.close();
        } catch {
          // Controller already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering on Vercel
    },
  });
}
