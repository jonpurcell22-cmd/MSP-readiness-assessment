"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AssessmentLayout } from "@/components/assessment-layout"
import { Spinner } from "@/components/ui/spinner"

type Path = "scratch" | "not_producing" | "producing_broken"
type RoutingQ1 = "scratch" | "rebuild"
type RoutingQ2 = "no_revenue" | "has_revenue"
type Step = "routing_q1" | "routing_q2" | "yes_no" | "multi_select" | "open_text" | "submitting" | "error"

const SCRATCH_QUESTIONS = [
  "Do you have active interest from customers and/or partners about your product as part of a managed service offering today?",
  "Can an MSP manage multiple client environments from a single login in your product today?",
  "Is your pricing and packaging structured in a way that works for how MSPs buy and sell?",
  "Does your current compensation plan account for revenue generated through indirect or partner-led sales?",
  "Is there a named executive sponsor for the MSP program with budget authority?",
]

const NOT_PRODUCING_QUESTIONS = [
  "Do you have a clear understanding of why your program isn't generating revenue?",
  "Can an MSP manage multiple client environments from a single login in your product today?",
  "Is your pricing and packaging structured in a way that works for how MSPs buy and sell?",
  "Does your current compensation plan account for revenue generated through indirect or partner-led sales?",
  "Is there an executive sponsor actively invested in turning this program around?",
  "Do you have partners in your program today who believe in the opportunity but aren't transacting?",
]

const PAIN_POINTS = [
  "Partners are dissatisfied with the program",
  "Internal channel conflict is undermining partner relationships",
  "Partners are signed but not producing",
  "Leadership confidence in the program is declining",
  "Partner churn is increasing",
  "Revenue is concentrated in too few partners",
  "Partners are asking for product capabilities you don't have",
  "Poor support and enablement are leading to negative partner and customer experiences",
]

function AssessmentPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const assessmentId = searchParams.get("id") ?? ""

  const [step, setStep] = useState<Step>("routing_q1")
  const [routingQ1, setRoutingQ1] = useState<RoutingQ1 | null>(null)
  const [routingQ2, setRoutingQ2] = useState<RoutingQ2 | null>(null)
  const [path, setPath] = useState<Path | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [yesNoAnswers, setYesNoAnswers] = useState<boolean[]>([])
  const [selectedPainPoints, setSelectedPainPoints] = useState<Set<number>>(new Set())
  const [errorMsg, setErrorMsg] = useState("")
  const [openText, setOpenText] = useState("")
  const [pendingSubmit, setPendingSubmit] = useState<{
    path: Path; q1: RoutingQ1; q2: RoutingQ2 | null; answers: boolean[] | number[]
  } | null>(null)

  const [firstName, setFirstName] = useState("")
  useEffect(() => {
    if (typeof window !== "undefined") {
      setFirstName(sessionStorage.getItem("assessment_first_name") ?? "")
    }
  }, [])

  if (!assessmentId) {
    return (
      <AssessmentLayout>
        <div style={{ display: "flex", minHeight: "50vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
          <p style={{ color: "#8b8b9a" }}>Invalid assessment link. Please start from the beginning.</p>
          <button className="btn-primary" style={{ padding: "10px 24px", border: "none", cursor: "pointer", borderRadius: 12 }} onClick={() => router.push("/")}>Go Back</button>
        </div>
      </AssessmentLayout>
    )
  }

  const questions = path === "scratch" ? SCRATCH_QUESTIONS : NOT_PRODUCING_QUESTIONS
  const totalYesNo = path === "scratch" ? 5 : 6

  async function submitAnswers(finalPath: Path, finalQ1: RoutingQ1, finalQ2: RoutingQ2 | null, answers: boolean[] | number[], finalOpenText: string) {
    setStep("submitting")
    try {
      const res = await fetch(`/api/assessment/${assessmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: finalPath,
          routing_q1: finalQ1,
          routing_q2: finalQ2,
          answers,
          open_text: finalOpenText.trim() || null,
        }),
      })
      if (!res.ok) throw new Error("Submit failed")
      router.push(`/assessment/results/${assessmentId}`)
    } catch {
      setErrorMsg("Something went wrong saving your answers. Please try again.")
      setStep("error")
    }
  }

  function goToOpenText(p: Path, q1: RoutingQ1, q2: RoutingQ2 | null, answers: boolean[] | number[]) {
    setPendingSubmit({ path: p, q1, q2, answers })
    setStep("open_text")
  }

  function handleRoutingQ1(answer: RoutingQ1) {
    setRoutingQ1(answer)
    if (answer === "scratch") {
      setPath("scratch")
      setStep("yes_no")
    } else {
      setStep("routing_q2")
    }
  }

  function handleRoutingQ2(answer: RoutingQ2) {
    setRoutingQ2(answer)
    if (answer === "no_revenue") {
      setPath("not_producing")
      setStep("yes_no")
    } else {
      setPath("producing_broken")
      setStep("multi_select")
    }
  }

  function handleYesNo(answer: boolean) {
    const newAnswers = [...yesNoAnswers, answer]
    setYesNoAnswers(newAnswers)
    if (newAnswers.length < totalYesNo) {
      setCurrentQ(currentQ + 1)
    } else {
      goToOpenText(path!, routingQ1!, routingQ2 ?? null, newAnswers)
    }
  }

  function togglePainPoint(index: number) {
    const next = new Set(selectedPainPoints)
    if (next.has(index)) {
      next.delete(index)
    } else if (next.size < 3) {
      next.add(index)
    }
    setSelectedPainPoints(next)
  }

  function handleMultiSelectSubmit() {
    if (selectedPainPoints.size === 0) return
    goToOpenText("producing_broken", routingQ1!, routingQ2!, Array.from(selectedPainPoints))
  }

  const eyebrowStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#8b8b9a",
    marginBottom: 16,
  }

  const headlineStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: "-0.02em",
    lineHeight: 1.3,
    marginBottom: 8,
  }

  // --- ROUTING Q1 ---
  if (step === "routing_q1") {
    return (
      <AssessmentLayout>
        <div style={{ maxWidth: 580, margin: "0 auto", paddingTop: 32, width: "100%" }}>
          {firstName && (
            <p style={{ color: "#8b8b9a", fontSize: 14, marginBottom: 28 }}>
              Hi {firstName} — let&apos;s get started.
            </p>
          )}
          <p style={eyebrowStyle}>Question 1 of 2</p>
          <h2 style={headlineStyle}>
            Are you building your MSP program for the first time, or rebuilding an existing one?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32 }}>
            <button
              onClick={() => handleRoutingQ1("scratch")}
              className="answer-option"
              style={{ padding: "20px 24px", textAlign: "left", border: "none", width: "100%" }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", display: "block", marginBottom: 4 }}>
                Building from scratch
              </span>
              <span style={{ fontSize: 13, color: "#8b8b9a" }}>
                We don&apos;t have an MSP program yet
              </span>
            </button>
            <button
              onClick={() => handleRoutingQ1("rebuild")}
              className="answer-option"
              style={{ padding: "20px 24px", textAlign: "left", border: "none", width: "100%" }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", display: "block", marginBottom: 4 }}>
                Rebuilding
              </span>
              <span style={{ fontSize: 13, color: "#8b8b9a" }}>
                We have a program but it&apos;s not working
              </span>
            </button>
          </div>
        </div>
      </AssessmentLayout>
    )
  }

  // --- ROUTING Q2 ---
  if (step === "routing_q2") {
    return (
      <AssessmentLayout>
        <div style={{ maxWidth: 580, margin: "0 auto", paddingTop: 32, width: "100%" }}>
          <p style={eyebrowStyle}>Question 2 of 2</p>
          <h2 style={headlineStyle}>
            Is your program currently generating revenue?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32 }}>
            <button
              onClick={() => handleRoutingQ2("no_revenue")}
              className="answer-option"
              style={{ padding: "20px 24px", textAlign: "left", border: "none", width: "100%" }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", display: "block", marginBottom: 4 }}>
                No
              </span>
              <span style={{ fontSize: 13, color: "#8b8b9a" }}>
                The program exists but isn&apos;t producing revenue
              </span>
            </button>
            <button
              onClick={() => handleRoutingQ2("has_revenue")}
              className="answer-option"
              style={{ padding: "20px 24px", textAlign: "left", border: "none", width: "100%" }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", display: "block", marginBottom: 4 }}>
                Yes
              </span>
              <span style={{ fontSize: 13, color: "#8b8b9a" }}>
                It&apos;s generating revenue, but something isn&apos;t working
              </span>
            </button>
          </div>
          <button
            onClick={() => setStep("routing_q1")}
            style={{ marginTop: 28, fontSize: 13, color: "#8b8b9a", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8b8b9a")}
          >
            ← Back
          </button>
        </div>
      </AssessmentLayout>
    )
  }

  // --- YES/NO QUESTIONS ---
  if (step === "yes_no" && path) {
    const progress = Math.round((currentQ / totalYesNo) * 100)
    return (
      <AssessmentLayout>
        <div style={{ maxWidth: 580, margin: "0 auto", paddingTop: 32, width: "100%" }}>
          {/* Progress bar */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#8b8b9a" }}>Question {currentQ + 1} of {totalYesNo}</span>
              <span style={{ fontSize: 12, color: "#8b8b9a" }}>{progress}%</span>
            </div>
            <div style={{ height: 2, width: "100%", background: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: 2,
                  background: "#4cf37b",
                  boxShadow: "0 0 8px rgba(76,243,123,0.5)",
                  width: `${progress}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          <h2 style={{ ...headlineStyle, fontSize: 20, marginBottom: 36 }}>
            {questions[currentQ]}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => handleYesNo(true)}
              className="btn-primary"
              style={{ height: 56, width: "100%", fontSize: 16, border: "none", cursor: "pointer", borderRadius: 12 }}
            >
              Yes
            </button>
            <button
              onClick={() => handleYesNo(false)}
              className="answer-option"
              style={{
                height: 56,
                width: "100%",
                fontSize: 16,
                fontWeight: 600,
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
                borderRadius: 14,
              }}
            >
              No
            </button>
          </div>
        </div>
      </AssessmentLayout>
    )
  }

  // --- MULTI SELECT (PRODUCING BUT BROKEN) ---
  if (step === "multi_select") {
    return (
      <AssessmentLayout>
        <div style={{ maxWidth: 620, margin: "0 auto", paddingTop: 32, width: "100%" }}>
          <p style={eyebrowStyle}>Select up to 3</p>
          <h2 style={{ ...headlineStyle, marginBottom: 32 }}>
            Your program is generating revenue, but something isn&apos;t working. Select your top pain points:
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PAIN_POINTS.map((point, i) => {
              const selected = selectedPainPoints.has(i)
              const disabled = !selected && selectedPainPoints.size >= 3
              return (
                <button
                  key={i}
                  onClick={() => togglePainPoint(i)}
                  disabled={disabled}
                  className={`answer-option${selected ? " selected" : ""}`}
                  style={{
                    padding: "16px 20px",
                    textAlign: "left",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    border: "none",
                    opacity: disabled ? 0.3 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: selected ? "2px solid #4cf37b" : "2px solid rgba(255,255,255,0.2)",
                      background: selected ? "#4cf37b" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    {selected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="#0a0a0f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: selected ? "#ffffff" : "#c8c8d4" }}>
                    {point}
                  </span>
                </button>
              )
            })}
          </div>

          <div style={{ marginTop: 28 }}>
            <button
              onClick={handleMultiSelectSubmit}
              disabled={selectedPainPoints.size === 0}
              className="btn-primary"
              style={{
                height: 52,
                width: "100%",
                fontSize: 15,
                border: "none",
                cursor: selectedPainPoints.size === 0 ? "not-allowed" : "pointer",
                borderRadius: 12,
              }}
            >
              Get My Diagnosis →
            </button>
          </div>
        </div>
      </AssessmentLayout>
    )
  }

  // --- OPEN TEXT ---
  if (step === "open_text" && pendingSubmit) {
    const CHAR_LIMIT = 1000
    const remaining = CHAR_LIMIT - openText.length
    return (
      <AssessmentLayout>
        <div style={{ maxWidth: 580, margin: "0 auto", paddingTop: 32, width: "100%" }}>
          <h2 style={{ ...headlineStyle, marginBottom: 8 }}>
            Anything else you want me to know?
          </h2>
          <p style={{ color: "#8b8b9a", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            This is optional. Share context that might not have come through in the questions.
          </p>

          <div style={{ position: "relative" }}>
            <textarea
              value={openText}
              onChange={(e) => {
                if (e.target.value.length <= CHAR_LIMIT) setOpenText(e.target.value)
              }}
              placeholder="What's really going on with your MSP channel right now? Any context that would help me understand your situation."
              rows={5}
              className="input-dark"
              style={{ resize: "none", lineHeight: 1.6, paddingTop: 14, paddingBottom: 14 }}
            />
            <p
              style={{
                textAlign: "right",
                fontSize: 12,
                marginTop: 6,
                color: remaining < 100 ? "#f59e0b" : "#555566",
              }}
            >
              {remaining} characters remaining
            </p>
          </div>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => void submitAnswers(pendingSubmit.path, pendingSubmit.q1, pendingSubmit.q2, pendingSubmit.answers, openText)}
              className="btn-primary"
              style={{ height: 52, width: "100%", fontSize: 15, border: "none", cursor: "pointer", borderRadius: 12 }}
            >
              Get My Diagnosis →
            </button>
            <button
              onClick={() => void submitAnswers(pendingSubmit.path, pendingSubmit.q1, pendingSubmit.q2, pendingSubmit.answers, "")}
              style={{
                fontSize: 13,
                color: "#8b8b9a",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "center",
                padding: "4px 0",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8b8b9a")}
            >
              Skip
            </button>
          </div>
        </div>
      </AssessmentLayout>
    )
  }

  // --- SUBMITTING ---
  if (step === "submitting") {
    return (
      <AssessmentLayout>
        <div style={{ display: "flex", minHeight: "60vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, textAlign: "center" }}>
          <Spinner className="size-10" style={{ color: "#4cf37b" }} />
          <p style={{ fontSize: 15, fontWeight: 500, color: "#ffffff" }}>Saving your answers...</p>
        </div>
      </AssessmentLayout>
    )
  }

  // --- ERROR ---
  return (
    <AssessmentLayout>
      <div style={{ display: "flex", minHeight: "60vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#f87171" }}>{errorMsg}</p>
        <button
          className="btn-primary"
          style={{ padding: "12px 28px", border: "none", cursor: "pointer", borderRadius: 12, fontSize: 14 }}
          onClick={() => { setStep("routing_q1"); setYesNoAnswers([]); setCurrentQ(0) }}
        >
          Start Over
        </button>
      </div>
    </AssessmentLayout>
  )
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={null}>
      <AssessmentPageContent />
    </Suspense>
  )
}
