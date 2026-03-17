"use client"

import { useEffect, useRef, useState } from "react"
import { AssessmentLayout } from "@/components/assessment-layout"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Calendar } from "lucide-react"

interface ResultsContentProps {
  assessmentId: string
  firstName: string
  existingOutput: string | null
}

/** Parse the plain-text output into labeled sections for display. */
function parseOutput(text: string): { label: string; body: string }[] {
  const sectionLabels = ["VERDICT", "INSIGHT", "RISK", "DIAGNOSIS", "CONSEQUENCE", "ROOT CAUSE", "COST"]
  const lines = text.split("\n")
  const sections: { label: string; body: string }[] = []
  let currentLabel = ""
  let currentBody: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (sectionLabels.includes(trimmed.toUpperCase())) {
      if (currentLabel) {
        sections.push({ label: currentLabel, body: currentBody.join("\n").trim() })
      }
      currentLabel = trimmed
      currentBody = []
    } else if (trimmed) {
      currentBody.push(trimmed)
    }
  }
  if (currentLabel && currentBody.length) {
    sections.push({ label: currentLabel, body: currentBody.join("\n").trim() })
  }

  // If parsing fails (no labels found), treat whole text as one block
  if (sections.length === 0 && text.trim()) {
    return [{ label: "", body: text.trim() }]
  }
  return sections
}

export function ResultsContent({ assessmentId, firstName, existingOutput }: ResultsContentProps) {
  const [output, setOutput] = useState<string | null>(existingOutput)
  const [loadError, setLoadError] = useState<string | null>(null)
  const startedRef = useRef(false)

  const bookingUrl =
    process.env.NEXT_PUBLIC_BOOKING_URL ||
    "https://calendly.com/jon-untappedchannelstrategy"

  useEffect(() => {
    if (existingOutput || startedRef.current) return
    startedRef.current = true

    let cancelled = false

    const run = async () => {
      try {
        const res = await fetch(`/api/assessment/${assessmentId}/generate-output`, {
          method: "POST",
        })
        if (cancelled) return

        // Cached JSON response
        if (res.headers.get("content-type")?.includes("application/json")) {
          const data = (await res.json()) as { ok?: boolean; cached?: boolean; error?: string }
          if (data.error) {
            setLoadError(`Generation failed: ${data.error}`)
            return
          }
          // Cached: reload to get fresh server-rendered output
          window.location.reload()
          return
        }

        // SSE stream
        if (!res.body) throw new Error("No response body")
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          if (cancelled) { reader.cancel().catch(() => {}); return }
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            try {
              const event = JSON.parse(line.slice(6)) as {
                done?: boolean
                output?: string
                error?: string
              }
              if (!event.done) continue
              if (event.error) {
                if (!cancelled) setLoadError(`Generation failed: ${event.error}`)
                return
              }
              if (event.output) {
                if (!cancelled) setOutput(event.output)
              }
              return
            } catch { /* malformed SSE line */ }
          }
        }

        if (!cancelled && !output) {
          setLoadError("Generation timed out. Please refresh to try again.")
        }
      } catch {
        if (!cancelled) setLoadError("Something went wrong. Please refresh to try again.")
      }
    }

    run()
    return () => { cancelled = true }
  }, [assessmentId, existingOutput])

  // Loading state
  if (!output && !loadError) {
    return (
      <AssessmentLayout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
          <Spinner className="size-10 text-[var(--brand-green)]" />
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-[var(--brand-dark)]">
              Analyzing your answers...
            </p>
            <p className="text-sm text-muted-foreground">
              This takes about 15 seconds.
            </p>
          </div>
        </div>
      </AssessmentLayout>
    )
  }

  const sections = output ? parseOutput(output) : []

  return (
    <AssessmentLayout>
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-10 py-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your MSP Channel Assessment
          </p>
          <h1 className="text-2xl font-bold text-[var(--brand-dark)] sm:text-3xl">
            {firstName ? `Here's your diagnosis, ${firstName}.` : "Here's your diagnosis."}
          </h1>
        </div>

        {/* Error state */}
        {loadError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            {loadError}
          </div>
        )}

        {/* AI Output */}
        {sections.length > 0 && (
          <div className="flex flex-col gap-8">
            {sections.map(({ label, body }, i) => {
              // Last section contains the closing CTA line — render separately
              const isCta = body.toLowerCase().includes("book a call")
              const [mainBody, ctaLine] = isCta
                ? (() => {
                    const idx = body.lastIndexOf("\n")
                    if (idx > -1) return [body.slice(0, idx).trim(), body.slice(idx).trim()]
                    // If everything is the CTA, return empty main
                    return ["", body]
                  })()
                : [body, ""]

              return (
                <div key={i} className="flex flex-col gap-3">
                  {label && (
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-green)]">
                      {label}
                    </p>
                  )}
                  {mainBody && (
                    <p className="text-base leading-relaxed text-foreground">{mainBody}</p>
                  )}
                  {ctaLine && (
                    <p className="text-sm font-semibold text-[var(--brand-dark)]">{ctaLine}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* CTA */}
        <div className="-mx-6 -mb-8 bg-[var(--brand-dark)] px-6 py-14 text-center sm:py-16">
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Ready to turn this diagnosis into a plan?
          </h2>
          <p className="mx-auto mt-3 max-w-[440px] text-sm leading-relaxed text-white/70">
            Book a free 90-minute deep-dive with an MSP channel expert. No cost, no obligation.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              className="h-14 bg-[var(--brand-green)] px-10 text-base font-bold text-[var(--brand-dark)] shadow-lg transition-all duration-200 hover:bg-[var(--brand-green)]/90 hover:shadow-xl hover:scale-[1.02]"
              asChild
            >
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                <Calendar className="mr-2 h-5 w-5" />
                Book a Call
              </a>
            </Button>
          </div>
        </div>
      </div>
    </AssessmentLayout>
  )
}
