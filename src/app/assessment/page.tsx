"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AssessmentLayout } from "@/components/assessment-layout"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type Path = "scratch" | "not_producing" | "producing_broken"
type RoutingQ1 = "scratch" | "rebuild"
type RoutingQ2 = "no_revenue" | "has_revenue"
type Step = "routing_q1" | "routing_q2" | "yes_no" | "multi_select" | "submitting" | "error"

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

  // Restore first name from session
  const [firstName, setFirstName] = useState("")
  useEffect(() => {
    if (typeof window !== "undefined") {
      setFirstName(sessionStorage.getItem("assessment_first_name") ?? "")
    }
  }, [])

  if (!assessmentId) {
    return (
      <AssessmentLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-muted-foreground">Invalid assessment link. Please start from the beginning.</p>
          <Button onClick={() => router.push("/")}>Go Back</Button>
        </div>
      </AssessmentLayout>
    )
  }

  const questions = path === "scratch" ? SCRATCH_QUESTIONS : NOT_PRODUCING_QUESTIONS
  const totalYesNo = path === "scratch" ? 5 : 6

  async function submitAnswers(finalPath: Path, finalQ1: RoutingQ1, finalQ2: RoutingQ2 | null, answers: boolean[] | number[]) {
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
        }),
      })
      if (!res.ok) throw new Error("Submit failed")
      router.push(`/assessment/results/${assessmentId}`)
    } catch {
      setErrorMsg("Something went wrong saving your answers. Please try again.")
      setStep("error")
    }
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
      void submitAnswers(path!, routingQ1!, routingQ2 ?? null, newAnswers)
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
    void submitAnswers("producing_broken", routingQ1!, routingQ2!, Array.from(selectedPainPoints))
  }

  // --- ROUTING Q1 ---
  if (step === "routing_q1") {
    return (
      <AssessmentLayout>
        <div className="mx-auto flex w-full max-w-[600px] flex-col gap-10 pt-8">
          {firstName && (
            <p className="text-sm text-muted-foreground">Hi {firstName} — let's get started.</p>
          )}
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Question 1 of 2
            </p>
            <h2 className="text-2xl font-bold text-[var(--brand-dark)] leading-snug">
              Are you building your MSP program for the first time, or rebuilding an existing one?
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleRoutingQ1("scratch")}
              className="rounded-lg border-2 border-border bg-card px-6 py-5 text-left text-sm font-medium text-foreground transition-all hover:border-[var(--brand-green)] hover:bg-[var(--brand-green)]/5"
            >
              Building from scratch — we don't have an MSP program yet
            </button>
            <button
              onClick={() => handleRoutingQ1("rebuild")}
              className="rounded-lg border-2 border-border bg-card px-6 py-5 text-left text-sm font-medium text-foreground transition-all hover:border-[var(--brand-green)] hover:bg-[var(--brand-green)]/5"
            >
              Rebuilding — we have a program but it's not working
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
        <div className="mx-auto flex w-full max-w-[600px] flex-col gap-10 pt-8">
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Question 2 of 2
            </p>
            <h2 className="text-2xl font-bold text-[var(--brand-dark)] leading-snug">
              Is your program currently generating revenue?
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleRoutingQ2("no_revenue")}
              className="rounded-lg border-2 border-border bg-card px-6 py-5 text-left text-sm font-medium text-foreground transition-all hover:border-[var(--brand-green)] hover:bg-[var(--brand-green)]/5"
            >
              No — the program exists but isn't producing revenue
            </button>
            <button
              onClick={() => handleRoutingQ2("has_revenue")}
              className="rounded-lg border-2 border-border bg-card px-6 py-5 text-left text-sm font-medium text-foreground transition-all hover:border-[var(--brand-green)] hover:bg-[var(--brand-green)]/5"
            >
              Yes — it's generating revenue, but something isn't working
            </button>
          </div>
          <button
            onClick={() => setStep("routing_q1")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
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
        <div className="mx-auto flex w-full max-w-[600px] flex-col gap-10 pt-8">
          {/* Progress bar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Question {currentQ + 1} of {totalYesNo}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border">
              <div
                className="h-1.5 rounded-full bg-[var(--brand-green)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-[var(--brand-dark)] leading-snug sm:text-2xl">
            {questions[currentQ]}
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => handleYesNo(true)}
              className="flex-1 h-14 bg-[var(--brand-green)] text-[var(--brand-dark)] hover:bg-[var(--brand-green)]/90 font-bold text-base shadow-sm"
            >
              Yes
            </Button>
            <Button
              onClick={() => handleYesNo(false)}
              variant="outline"
              className="flex-1 h-14 font-bold text-base border-2"
            >
              No
            </Button>
          </div>
        </div>
      </AssessmentLayout>
    )
  }

  // --- MULTI SELECT (PRODUCING BUT BROKEN) ---
  if (step === "multi_select") {
    return (
      <AssessmentLayout>
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8 pt-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Select up to 3
            </p>
            <h2 className="text-xl font-bold text-[var(--brand-dark)] leading-snug sm:text-2xl">
              Your program is generating revenue, but something isn't working. Select your top pain points:
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {PAIN_POINTS.map((point, i) => {
              const selected = selectedPainPoints.has(i)
              const disabled = !selected && selectedPainPoints.size >= 3
              return (
                <button
                  key={i}
                  onClick={() => togglePainPoint(i)}
                  disabled={disabled}
                  className={`rounded-lg border-2 px-5 py-4 text-left text-sm font-medium transition-all ${
                    selected
                      ? "border-[var(--brand-green)] bg-[var(--brand-green)]/10 text-[var(--brand-dark)]"
                      : disabled
                      ? "border-border bg-card text-muted-foreground opacity-40 cursor-not-allowed"
                      : "border-border bg-card text-foreground hover:border-[var(--brand-green)] hover:bg-[var(--brand-green)]/5"
                  }`}
                >
                  <span className={`mr-3 inline-block h-4 w-4 rounded border-2 align-middle ${selected ? "border-[var(--brand-green)] bg-[var(--brand-green)]" : "border-current"}`} />
                  {point}
                </button>
              )
            })}
          </div>

          <Button
            onClick={handleMultiSelectSubmit}
            disabled={selectedPainPoints.size === 0}
            className="h-12 bg-[var(--brand-green)] text-[var(--brand-dark)] hover:bg-[var(--brand-green)]/90 font-bold text-base"
          >
            Get My Diagnosis →
          </Button>
        </div>
      </AssessmentLayout>
    )
  }

  // --- SUBMITTING ---
  if (step === "submitting") {
    return (
      <AssessmentLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
          <Spinner className="size-10 text-[var(--brand-green)]" />
          <p className="text-base font-medium text-[var(--brand-dark)]">Saving your answers...</p>
        </div>
      </AssessmentLayout>
    )
  }

  // --- ERROR ---
  return (
    <AssessmentLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <p className="text-base text-destructive">{errorMsg}</p>
        <Button onClick={() => { setStep("routing_q1"); setYesNoAnswers([]); setCurrentQ(0); }}>
          Start Over
        </Button>
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
