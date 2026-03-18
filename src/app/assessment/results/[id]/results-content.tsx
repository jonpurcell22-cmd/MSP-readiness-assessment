"use client"

import { useEffect, useRef, useState } from "react"
import { AssessmentLayout } from "@/components/assessment-layout"
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

        if (res.headers.get("content-type")?.includes("application/json")) {
          const data = (await res.json()) as { ok?: boolean; cached?: boolean; error?: string }
          if (data.error) {
            setLoadError(`Generation failed: ${data.error}`)
            return
          }
          window.location.reload()
          return
        }

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
        <div style={{ display: "flex", minHeight: "70vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, textAlign: "center" }}>
          <Spinner className="size-10" style={{ color: "#4cf37b" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ fontSize: 17, fontWeight: 600, color: "#ffffff" }}>
              Analyzing your answers...
            </p>
            <p style={{ fontSize: 14, color: "#8b8b9a" }}>
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
      <div style={{ maxWidth: 660, margin: "0 auto", width: "100%", paddingTop: 16, paddingBottom: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8b8b9a", marginBottom: 10 }}>
            Your MSP Channel Assessment
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.2, margin: 0 }}>
            {firstName ? `Here's your diagnosis, ${firstName}.` : "Here's your diagnosis."}
          </h1>
        </div>

        {/* Error state */}
        {loadError && (
          <div style={{ borderRadius: 12, border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)", padding: "16px 20px", marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: "#fbbf24", margin: 0 }}>{loadError}</p>
          </div>
        )}

        {/* AI Output sections */}
        {sections.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
            {sections.map(({ label, body }, i) => {
              const isCta = body.toLowerCase().includes("book a call")
              const [mainBody, ctaLine] = isCta
                ? (() => {
                    const idx = body.lastIndexOf("\n")
                    if (idx > -1) return [body.slice(0, idx).trim(), body.slice(idx).trim()]
                    return ["", body]
                  })()
                : [body, ""]

              return (
                <div
                  key={i}
                  className="card-dark"
                  style={{ padding: "24px 28px" }}
                >
                  {label && (
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4cf37b", marginBottom: 12, margin: "0 0 12px" }}>
                      {label}
                    </p>
                  )}
                  {mainBody && (
                    <p style={{ fontSize: 15, lineHeight: 1.7, color: "#d4d4e0", margin: 0 }}>
                      {mainBody}
                    </p>
                  )}
                  {ctaLine && (
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", marginTop: mainBody ? 12 : 0, margin: mainBody ? "12px 0 0" : 0 }}>
                      {ctaLine}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* CTA block */}
        <div
          style={{
            marginLeft: -24,
            marginRight: -24,
            marginBottom: -40,
            padding: "56px 32px",
            textAlign: "center",
            background: "linear-gradient(180deg, rgba(76,243,123,0.06) 0%, rgba(10,10,15,0) 100%)",
            borderTop: "1px solid rgba(76,243,123,0.12)",
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", margin: "0 0 12px" }}>
            Ready to turn this diagnosis into a plan?
          </h2>
          <p style={{ fontSize: 14, color: "#8b8b9a", lineHeight: 1.6, maxWidth: 400, margin: "0 auto 32px" }}>
            Book a free 90-minute deep-dive with an MSP channel expert. No cost, no obligation.
          </p>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 36px",
              fontSize: 15,
              textDecoration: "none",
              borderRadius: 12,
            }}
          >
            <Calendar style={{ width: 18, height: 18 }} />
            Book a Call
          </a>
        </div>
      </div>
    </AssessmentLayout>
  )
}
