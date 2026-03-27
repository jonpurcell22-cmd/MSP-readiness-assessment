"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AssessmentLayout } from "@/components/assessment-layout"
import { Spinner } from "@/components/ui/spinner"
import { QUESTIONS, calculateRawScore, rescaleScore, getMaturityLabel, calculateDimensionScore } from "@/data/questions"
import { VERTICAL_OPTIONS, COMPANY_SIZE_OPTIONS } from "@/lib/constants"
import type { AssessmentScores } from "@/types/assessment"

type Step = "questions" | "lead_capture" | "submitting" | "error"

function CustomSelect({ options, placeholder, value, onChange }: {
  options: readonly string[]
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%",
          backgroundColor: "#222222",
          border: `1px solid ${open ? "#4CF37B" : "#2a2a2a"}`,
          borderRadius: 8,
          padding: "12px 36px 12px 12px",
          textAlign: "left",
          color: value ? "#ffffff" : "#555566",
          fontSize: 14,
          fontFamily: "'Lato', sans-serif",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "border-color 0.2s ease",
        }}
      >
        <span>{value || placeholder}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ flexShrink: 0, transition: "transform 0.2s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M2 4l4 4 4-4" stroke="#8b8b9a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          backgroundColor: "#222222",
          border: "1px solid #4CF37B",
          borderRadius: 8,
          zIndex: 50,
          overflow: "hidden",
        }}>
          {options.map(option => (
            <div
              key={option}
              onMouseDown={() => { onChange(option); setOpen(false) }}
              style={{
                padding: "10px 12px",
                cursor: "pointer",
                fontSize: 14,
                fontFamily: "'Lato', sans-serif",
                backgroundColor: value === option ? "#1a3a25" : "transparent",
                color: value === option ? "#4CF37B" : "#ffffff",
                transition: "background-color 0.15s ease, color 0.15s ease",
              }}
              onMouseEnter={e => {
                if (value !== option) {
                  e.currentTarget.style.backgroundColor = "#1a3a25"
                  e.currentTarget.style.color = "#4CF37B"
                }
              }}
              onMouseLeave={e => {
                if (value !== option) {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = "#ffffff"
                }
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("questions")
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedPoints, setSelectedPoints] = useState<Record<string, number>>({})
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [vertical, setVertical] = useState("")
  const [companySize, setCompanySize] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const firstQuestionRef = useRef<HTMLDivElement | null>(null)
  const questionRefs = useRef<(HTMLDivElement | null)[]>([])
  const leadCaptureRef = useRef<HTMLDivElement | null>(null)
  const submittingRef = useRef<HTMLDivElement | null>(null)

  const answeredCount = Object.keys(selectedPoints).length
  const isComplete = answeredCount === QUESTIONS.length

  function handleBeginAssessment() {
    firstQuestionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  function handleSelectAnswer(qi: number, option: { text: string; points: number }) {
    const question = QUESTIONS[qi]
    setSelectedPoints(prev => ({ ...prev, [question.id]: option.points }))
    setSelectedAnswers(prev => ({ ...prev, [question.id]: option.text }))

    if (qi < QUESTIONS.length - 1) {
      const nextIndex = qi + 1
      setCurrentQ(nextIndex)
      setTimeout(() => {
        questionRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 120)
    } else {
      setCurrentQ(QUESTIONS.length)
    }
  }

  function handleGetResults() {
    if (!isComplete) return
    setStep("lead_capture")
    setTimeout(() => {
      leadCaptureRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 80)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep("submitting")
    setTimeout(() => {
      submittingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 80)

    const raw = calculateRawScore(selectedPoints)
    const overall = rescaleScore(raw)
    const arch = calculateDimensionScore(selectedPoints, "arch")
    const gtm = calculateDimensionScore(selectedPoints, "gtm")
    const px = calculateDimensionScore(selectedPoints, "px")
    const maturityLabel = getMaturityLabel(overall)
    const scores: AssessmentScores = { overall, arch, gtm, px, maturityLabel }

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            vertical: vertical || undefined,
            companySize: companySize || undefined,
          },
          answers: selectedAnswers,
          points: selectedPoints,
          scores,
        }),
      })
      if (!res.ok) throw new Error("Submit failed")
      const data = await res.json() as { id: string }
      router.push(`/assessment/results/${data.id}`)
    } catch {
      setErrorMsg("Something went wrong. Please try again.")
      setStep("error")
    }
  }

  const fillPct = (answeredCount / QUESTIONS.length) * 100

  return (
    <AssessmentLayout>
      {/* Progress bar — only shown once assessment has started */}
      {answeredCount > 0 && (
        <>
          {/* Desktop: vertical */}
          <div
            className="hidden md:block"
            style={{ position: "fixed", left: 0, top: 0, width: 4, height: "100vh", zIndex: 20, background: "#2a2a2a" }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: `${fillPct}%`, background: "#4cf37b", transition: "height 0.4s ease", overflow: "visible" }}>
              <div style={{ position: "absolute", bottom: 0, left: 8, color: "#4cf37b", fontSize: 10, fontFamily: "'Raleway', sans-serif", fontWeight: 600, whiteSpace: "nowrap", lineHeight: 1, paddingBottom: 2 }}>
                {answeredCount} of 7
              </div>
            </div>
          </div>
          {/* Mobile: horizontal */}
          <div
            className="md:hidden"
            style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 20, background: "#2a2a2a" }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${fillPct}%`, background: "#4cf37b", transition: "width 0.4s ease" }} />
            <div style={{ position: "absolute", top: 5, left: `${fillPct}%`, transform: "translateX(-100%)", color: "#4cf37b", fontSize: 10, fontFamily: "'Raleway', sans-serif", fontWeight: 600, whiteSpace: "nowrap", paddingRight: 4 }}>
              {answeredCount} of 7
            </div>
          </div>
        </>
      )}

      {/* Hero */}
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0 60px", scrollSnapAlign: "start" }}>
        <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8b8b9a", marginBottom: 20, fontFamily: "'Raleway', sans-serif" }}>
            Untapped Channel Strategy
          </p>
          <h1 className="text-4xl md:text-6xl" style={{ fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: 20, fontFamily: "'Raleway', sans-serif" }}>
            MSP Channel{" "}
            <span style={{ color: "#4cf37b" }}>Readiness</span>{" "}
            Assessment
          </h1>
          <p style={{ color: "#8b8b9a", fontSize: 17, lineHeight: 1.7, maxWidth: 440, margin: "0 auto 40px", fontFamily: "'Lato', sans-serif" }}>
            7 questions.<br />
            A direct diagnosis of your MSP channel maturity from an expert who has built programs at<br />
            <span style={{ color: "#ffffff", fontWeight: 600 }}>Apple and VMware.</span>
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <button
              onClick={handleBeginAssessment}
              className="btn-primary"
              style={{ padding: "18px 48px", border: "none", cursor: "pointer", fontSize: 15 }}
            >
              Begin Assessment
            </button>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "#4cf37b", animation: "bounceDown 1.4s ease-in-out infinite" }}>
              <path d="M12 5v12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
              <path d="M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
            <p style={{ fontSize: 12, color: "#555566", margin: 0, fontFamily: "'Lato', sans-serif" }}>
              Takes about 3 minutes
            </p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ width: "100%" }}>
        {QUESTIONS.slice(0, currentQ + 1).map((question, qi) => {
          const isActive = qi === currentQ
          const selectedOptionPoints = selectedPoints[question.id]
          const isLast = qi === QUESTIONS.length - 1

          return (
            <div
              key={question.id}
              ref={el => {
                questionRefs.current[qi] = el
                if (qi === 0) firstQuestionRef.current = el
              }}
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 0 60px",
                scrollSnapAlign: "start",
              }}
            >
              <div
                className="card-dark"
                style={{
                  width: "100%",
                  maxWidth: 700,
                  padding: "32px 28px",
                  borderLeft: "3px solid #4cf37b",
                  opacity: isActive ? 1 : 0.55,
                  transition: "opacity 0.3s ease",
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8b8b9a", margin: "0 0 12px", fontFamily: "'Raleway', sans-serif" }}>
                  Question {qi + 1} of {QUESTIONS.length}
                </p>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#ffffff", lineHeight: 1.4, margin: "0 0 24px", fontFamily: "'Raleway', sans-serif" }}>
                  {question.text}
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {question.options.map((option, oi) => {
                    const isSelected = selectedOptionPoints === option.points
                    return (
                      <button
                        key={oi}
                        onClick={() => isActive && handleSelectAnswer(qi, option)}
                        disabled={!isActive}
                        style={{
                          padding: "16px 20px",
                          textAlign: "left",
                          width: "100%",
                          background: isSelected ? "rgba(76,243,123,0.08)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${isSelected ? "#4cf37b" : "#2a2a2a"}`,
                          borderRadius: 12,
                          cursor: isActive ? "pointer" : "default",
                          transition: "border-color 0.15s, background 0.15s",
                          boxShadow: isSelected ? "0 0 16px rgba(76,243,123,0.12)" : "none",
                        }}
                        onMouseEnter={e => {
                          if (isActive && !isSelected) {
                            e.currentTarget.style.borderColor = "rgba(76,243,123,0.4)"
                            e.currentTarget.style.background = "rgba(76,243,123,0.04)"
                          }
                        }}
                        onMouseLeave={e => {
                          if (isActive && !isSelected) {
                            e.currentTarget.style.borderColor = "#2a2a2a"
                            e.currentTarget.style.background = "rgba(255,255,255,0.02)"
                          }
                        }}
                      >
                        <span style={{ fontSize: 15, fontWeight: 500, color: isSelected ? "#ffffff" : "#c8c8d4", lineHeight: 1.6, display: "block" }}>
                          {option.text}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Get My Results — shown below last question once all answered */}
              {isLast && isComplete && (
                <div style={{ width: "100%", maxWidth: 700, marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                  <button
                    onClick={handleGetResults}
                    className="btn-primary"
                    style={{ width: "100%", padding: "18px 32px", border: "none", cursor: "pointer", fontSize: 15 }}
                  >
                    Get My Results
                  </button>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "#4cf37b", animation: "bounceDown 1.4s ease-in-out infinite" }}>
                    <path d="M12 5v12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                    <path d="M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lead capture */}
      {step === "lead_capture" && (
        <div
          ref={leadCaptureRef}
          style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0 60px", scrollSnapAlign: "start" }}
        >
          <div style={{ maxWidth: 540, width: "100%" }}>
            <div className="card-dark" style={{ padding: "40px 36px", borderLeft: "3px solid #4cf37b" }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8b8b9a", margin: "0 0 8px", fontFamily: "'Raleway', sans-serif" }}>
                Almost there
              </p>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", margin: "0 0 8px", fontFamily: "'Raleway', sans-serif", lineHeight: 1.3 }}>
                Where should we send your scorecard?
              </h2>
              <p style={{ fontSize: 14, color: "#8b8b9a", margin: "0 0 28px", fontFamily: "'Lato', sans-serif", lineHeight: 1.6 }}>
                Your personalized MSP readiness report is ready. Enter your details to see your results.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#8b8b9a", fontFamily: "'Raleway', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                      First Name
                    </label>
                    <input className="input-dark" type="text" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#8b8b9a", fontFamily: "'Raleway', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                      Last Name
                    </label>
                    <input className="input-dark" type="text" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#8b8b9a", fontFamily: "'Raleway', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    Work Email
                  </label>
                  <input className="input-dark" type="email" placeholder="jane@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#8b8b9a", fontFamily: "'Raleway', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    Vertical <span style={{ color: "#555566", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <CustomSelect options={VERTICAL_OPTIONS} placeholder="Select your vertical..." value={vertical} onChange={setVertical} />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#8b8b9a", fontFamily: "'Raleway', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    Company Size <span style={{ color: "#555566", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <CustomSelect options={COMPANY_SIZE_OPTIONS} placeholder="Select size..." value={companySize} onChange={setCompanySize} />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%", padding: "18px 32px", border: "none", cursor: "pointer", fontSize: 15, marginTop: 8 }}
                >
                  See My Results
                </button>

                <p style={{ fontSize: 12, color: "#555566", textAlign: "center", margin: 0, fontFamily: "'Lato', sans-serif" }}>
                  No spam. Your results are emailed to you once.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Building scorecard */}
      {step === "submitting" && (
        <div
          ref={submittingRef}
          style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, textAlign: "center", scrollSnapAlign: "start" }}
        >
          <Spinner className="size-10" style={{ color: "#4cf37b" }} />
          <p style={{ fontSize: 15, fontWeight: 500, color: "#ffffff", fontFamily: "'Raleway', sans-serif" }}>Building your scorecard...</p>
        </div>
      )}

      {/* Error */}
      {step === "error" && (
        <div
          ref={submittingRef}
          style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, textAlign: "center", scrollSnapAlign: "start" }}
        >
          <p style={{ fontSize: 14, color: "#f87171", fontFamily: "'Lato', sans-serif" }}>{errorMsg}</p>
          <button
            className="btn-primary"
            style={{ padding: "12px 28px", border: "none", cursor: "pointer", fontSize: 14 }}
            onClick={() => { setStep("questions"); setCurrentQ(0); setSelectedPoints({}); setSelectedAnswers({}) }}
          >
            Start Over
          </button>
        </div>
      )}
    </AssessmentLayout>
  )
}
