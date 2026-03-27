"use client"

import { useEffect, useState } from "react"
import { AssessmentLayout } from "@/components/assessment-layout"
import { Spinner } from "@/components/ui/spinner"
import { Calendar } from "lucide-react"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts"
import type { AssessmentOutput, AssessmentScores } from "@/types/assessment"

interface ResultsContentProps {
  assessmentId: string
  firstName: string
  scores: AssessmentScores | null
  existingOutput: AssessmentOutput | null
}

const SECTION: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "80px 0 60px",
  width: "100%",
  scrollSnapAlign: "start",
}

const CARD_MAX = 700

export function ResultsContent({
  assessmentId,
  firstName,
  scores,
  existingOutput,
}: ResultsContentProps) {
  const [output, setOutput] = useState<AssessmentOutput | null>(existingOutput)
  const [loadError, setLoadError] = useState<string | null>(null)

  const bookingUrl =
    process.env.NEXT_PUBLIC_BOOKING_URL ||
    "https://calendly.com/jon-untappedchannelstrategy/30min"

  useEffect(() => {
    if (existingOutput) return

    let cancelled = false

    const run = async () => {
      try {
        const res = await fetch(`/api/assessment/${assessmentId}/generate-output`, {
          method: "POST",
        })
        if (cancelled) return

        const raw = await res.text()

        if (!res.ok) {
          let msg = `HTTP ${res.status}`
          try { msg = (JSON.parse(raw) as { error?: string }).error ?? msg } catch { /* ignore */ }
          setLoadError(`Generation failed: ${msg}`)
          return
        }

        let data: { output: AssessmentOutput }
        try {
          data = JSON.parse(raw) as { output: AssessmentOutput }
        } catch {
          setLoadError(`Bad response from server: ${raw.slice(0, 200)}`)
          return
        }

        if (!data.output) {
          setLoadError("Server returned empty output.")
          return
        }

        if (!cancelled) setOutput(data.output)
      } catch (err) {
        if (!cancelled) setLoadError(`Network error: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    run()
    return () => { cancelled = true }
  }, [assessmentId, existingOutput])

  // Loading
  if (!output && !loadError) {
    return (
      <AssessmentLayout>
        <div style={{ display: "flex", minHeight: "70vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, textAlign: "center" }}>
          <Spinner className="size-10" style={{ color: "#4cf37b" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ fontSize: 17, fontWeight: 600, color: "#ffffff", fontFamily: "'Raleway', sans-serif" }}>Building your scorecard...</p>
            <p style={{ fontSize: 14, color: "#8b8b9a", fontFamily: "'Lato', sans-serif" }}>This takes about 15 seconds.</p>
          </div>
        </div>
      </AssessmentLayout>
    )
  }

  const radarData = scores
    ? [
        { dimension: "Channel Architecture", score: scores.arch },
        { dimension: "Go-to-Market Alignment", score: scores.gtm },
        { dimension: "Partner Experience", score: scores.px },
      ]
    : []

  return (
    <AssessmentLayout>

      {/* ── Section 1: Diagnosis + Priority Focus ── */}
      <div style={SECTION}>
        <div style={{ width: "100%", maxWidth: CARD_MAX, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Header */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8b8b9a", margin: "0 0 12px", fontFamily: "'Raleway', sans-serif" }}>
              Your MSP Channel Scorecard
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 16px", fontFamily: "'Raleway', sans-serif" }}>
              {firstName ? `Here's your diagnosis, ${firstName}.` : "Here's your diagnosis."}
            </h1>
            {scores && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ color: "#4cf37b", background: "#1a3a25", borderRadius: 9999, padding: "4px 14px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Raleway', sans-serif" }}>
                    {scores.maturityLabel}
                  </span>
                  <span style={{ fontSize: 13, color: "#999999", fontFamily: "'Lato', sans-serif" }}>
                    {scores.maturityLabel === "Foundation-Building" && "Your program needs structural groundwork before anything else will stick."}
                    {scores.maturityLabel === "Emerging" && "Early signals are there. The gaps keeping you from traction are fixable."}
                    {scores.maturityLabel === "Developing" && "You are close. One or two structural gaps are creating a ceiling."}
                    {scores.maturityLabel === "Scaling" && "Your program works. The question now is how far you take it."}
                    {scores.maturityLabel === "Optimized" && "You have built something rare. The next conversation is about acceleration."}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#999999", fontFamily: "'Lato', sans-serif" }}>
                  Overall Score: <span style={{ color: "#ffffff", fontWeight: 600 }}>{scores.overall}/100</span>
                  <span style={{ marginLeft: 8 }}>(out of 100, based on 7 program readiness factors weighted by impact)</span>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {loadError && (
            <div style={{ borderRadius: 12, border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)", padding: "16px 20px" }}>
              <p style={{ fontSize: 13, color: "#fbbf24", margin: 0, fontFamily: "'Lato', sans-serif" }}>{loadError}</p>
            </div>
          )}

          {/* Priority Focus */}
          {output && (
            <div className="card-dark" style={{ padding: "28px 32px", borderLeft: "3px solid #4cf37b" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4cf37b", margin: "0 0 12px", fontFamily: "'Raleway', sans-serif" }}>
                Priority Focus
              </p>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#ffffff", margin: 0, lineHeight: 1.5, fontFamily: "'Raleway', sans-serif" }}>
                {output.priority_focus}
              </p>
            </div>
          )}

          {/* Down arrow */}
          {output && (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "#4cf37b", animation: "bounceDown 1.4s ease-in-out infinite" }}>
                <path d="M12 5v12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                <path d="M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2: Dimension Scores ── */}
      {output && scores && radarData.length > 0 && (
        <div style={SECTION}>
          <div style={{ width: "100%", maxWidth: CARD_MAX, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="card-dark" style={{ padding: "32px 28px", borderLeft: "3px solid #4cf37b" }}>
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", margin: "0 0 6px", fontFamily: "'Raleway', sans-serif" }}>
                  Where Your Program Stands
                </p>
                <p style={{ fontSize: 13, color: "#999999", margin: 0, fontFamily: "'Lato', sans-serif", lineHeight: 1.5 }}>
                  Your score across the three dimensions that determine MSP program success. Weighted by the factors that actually kill programs in practice.
                </p>
              </div>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#2a2a2a" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fill: "#8b8b9a", fontSize: 12, fontWeight: 500 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#4cf37b"
                      fill="#4cf37b"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", marginTop: 20, paddingTop: 20, borderTop: "1px solid #2a2a2a" }}>
                {radarData.map(({ dimension, score }) => {
                  const descriptor: Record<string, string> = {
                    "Channel Architecture": "Can MSPs transact, deploy, and operate your product at scale?",
                    "Go-to-Market Alignment": "Is your org structured to support the channel or work against it?",
                    "Partner Experience": "What do MSPs actually encounter when they engage you?",
                  }
                  return (
                    <div key={dimension} style={{ textAlign: "center", maxWidth: 120 }}>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", margin: 0, fontFamily: "'Raleway', sans-serif" }}>{score}</p>
                      <p style={{ fontSize: 11, color: "#8b8b9a", margin: "4px 0 4px", fontFamily: "'Lato', sans-serif" }}>{dimension}</p>
                      <p style={{ fontSize: 11, color: "#999999", margin: 0, fontFamily: "'Lato', sans-serif", lineHeight: 1.4 }}>{descriptor[dimension]}</p>
                    </div>
                  )
                })}
              </div>
              <p style={{ fontSize: 11, color: "#999999", textAlign: "center", margin: "20px 0 0", fontFamily: "'Lato', sans-serif", paddingTop: 16, borderTop: "1px solid #2a2a2a" }}>
                Go-to-Market Alignment is weighted more heavily. It is the dimension that determines whether everything else holds.
              </p>
            </div>

            {/* Down arrow */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "#4cf37b", animation: "bounceDown 1.4s ease-in-out infinite" }}>
                <path d="M12 5v12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                <path d="M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 3: Narrative + CTA ── */}
      {output && (
        <div style={SECTION}>
          <div style={{ width: "100%", maxWidth: CARD_MAX, display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Narrative — scrollable */}
            <div className="card-dark" style={{ padding: "28px 32px", borderLeft: "3px solid #4cf37b" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4cf37b", margin: "0 0 16px", fontFamily: "'Raleway', sans-serif" }}>
                Your Personalized Analysis
              </p>
              <div style={{ position: "relative" }}>
              <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 8, paddingBottom: 48 }}>
                {output.narrative.split("\n\n").map((para, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: 15,
                      lineHeight: 1.75,
                      color: "#d4d4e0",
                      margin: i > 0 ? "16px 0 0" : "0",
                      fontFamily: "'Lato', sans-serif",
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
              {/* Fade + scroll indicator */}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 8,
                height: 48,
                background: "linear-gradient(to bottom, transparent, #222222)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 4,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: "#4cf37b", animation: "bounceDown 1.4s ease-in-out infinite" }}>
                  <path d="M12 5v12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                  <path d="M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
              </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{
              padding: "36px 32px",
              textAlign: "center",
              background: "rgba(76, 243, 123, 0.08)",
              border: "1px solid rgba(76, 243, 123, 0.3)",
              borderRadius: 16,
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", margin: "0 0 10px", fontFamily: "'Raleway', sans-serif" }}>
                Ready to turn this diagnosis into a plan?
              </h2>
              <p style={{ fontSize: 14, color: "#8b8b9a", lineHeight: 1.6, maxWidth: 380, margin: "0 auto 28px", fontFamily: "'Lato', sans-serif" }}>
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
                Book a Strategy Call
              </a>
            </div>

          </div>
        </div>
      )}

    </AssessmentLayout>
  )
}
