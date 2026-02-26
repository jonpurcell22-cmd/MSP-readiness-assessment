"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { AssessmentLayout } from "@/components/assessment-layout"
import { SectionStepper } from "@/components/section-stepper"
import { AnswerCard } from "@/components/answer-card"
import { Button } from "@/components/ui/button"
import { sections } from "@/lib/assessment-data"
import type { Answers } from "@/types/assessment"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AssessmentSectionPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const sectionNum = Number(params.section)
  const assessmentId = searchParams.get("id")
  const section = sections[sectionNum - 1]

  const [allAnswers, setAllAnswers] = useState<Answers>({})
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!assessmentId) return

    async function loadAnswers() {
      try {
        const res = await fetch(`/api/assessment/${assessmentId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.answers && Object.keys(data.answers).length > 0) {
            setAllAnswers(data.answers)
          }
        }
      } finally {
        setLoaded(true)
      }
    }

    loadAnswers()
  }, [assessmentId])

  const currentAnswers = allAnswers[section?.id] || {}
  const allQuestionsAnswered = section
    ? section.questions.every((q) => currentAnswers[q.id] !== undefined)
    : false

  const handleAnswer = useCallback(
    (questionId: string, score: number) => {
      if (!section) return
      setAllAnswers((prev) => ({
        ...prev,
        [section.id]: {
          ...(prev[section.id] || {}),
          [questionId]: score,
        },
      }))
    },
    [section]
  )

  async function saveAndNavigate(direction: "prev" | "next") {
    if (!assessmentId || !section) return
    setSaving(true)

    try {
      await fetch(`/api/assessment/${assessmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: allAnswers }),
      })

      if (direction === "next") {
        if (sectionNum < 6) {
          router.push(`/assessment/${sectionNum + 1}?id=${assessmentId}`)
        } else if (sectionNum === 6) {
          router.push(`/assessment/channel-gate?id=${assessmentId}`)
        } else {
          router.push(`/assessment/financial?id=${assessmentId}`)
        }
      } else {
        if (sectionNum > 1 && sectionNum < 7) {
          router.push(`/assessment/${sectionNum - 1}?id=${assessmentId}`)
        } else if (sectionNum === 7) {
          router.push(`/assessment/channel-gate?id=${assessmentId}`)
        } else {
          router.push("/")
        }
      }
    } finally {
      setSaving(false)
    }
  }

  if (!section) {
    return (
      <AssessmentLayout>
        <p className="py-20 text-center text-muted-foreground">
          Invalid section. Please start the assessment from the beginning.
        </p>
      </AssessmentLayout>
    )
  }

  return (
    <AssessmentLayout>
      <div className="animate-slide-in">
        {/* Section stepper */}
        <div className="mb-8 flex justify-center">
          <SectionStepper currentSection={sectionNum} />
        </div>

        {/* Section header */}
        <div className="mb-8 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-editorial text-[var(--brand-green)]">
            Section {sectionNum} of 7
          </p>
          <h1 className="text-2xl font-bold text-[var(--brand-dark)] sm:text-[1.7rem]">
            {section.title}
          </h1>
          <p className="text-muted-foreground leading-relaxed">{section.description}</p>
        </div>

        {/* Question completion dots */}
        {loaded && (
          <div className="mb-8 flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Progress:</span>
            <div className="flex items-center gap-1.5">
              {section.questions.map((q, i) => {
                const isAnswered = currentAnswers[q.id] !== undefined
                return (
                  <div
                    key={q.id}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300",
                      isAnswered
                        ? "bg-[var(--brand-green)] text-[var(--brand-dark)]"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isAnswered ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                  </div>
                )
              })}
            </div>
            <span className="text-xs text-muted-foreground">
              {Object.keys(currentAnswers).length}/{section.questions.length}
            </span>
          </div>
        )}

        {/* Questions */}
        {loaded ? (
          <div className="flex flex-col gap-10">
            {section.questions.map((question, qIndex) => (
              <div
                key={question.id}
                className="animate-fade-in-up flex flex-col gap-4"
                style={{ animationDelay: `${qIndex * 80}ms` }}
              >
                <div className="flex flex-col gap-1.5">
                  <p className="text-base font-semibold text-[var(--brand-dark)]">
                    <span className="mr-1.5 text-xs font-bold uppercase tracking-editorial text-muted-foreground">
                      Q{qIndex + 1}
                    </span>
                    {question.name}
                  </p>
                  {/* Pull-quote style context */}
                  <div className="border-l-2 border-[var(--brand-green)] pl-3">
                    <p className="text-sm italic text-muted-foreground">
                      {question.context}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                  {question.options.map((opt) => (
                    <AnswerCard
                      key={opt.score}
                      score={opt.score}
                      label={opt.label}
                      selected={currentAnswers[question.id] === opt.score}
                      onClick={() => handleAnswer(question.id, opt.score)}
                    />
                  ))}
                </div>
                {/* Thin divider */}
                {qIndex < section.questions.length - 1 && (
                  <div className="mt-2 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-20 animate-pulse rounded-lg bg-muted"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
          <Button
            variant="outline"
            onClick={() => saveAndNavigate("prev")}
            disabled={saving}
            className="h-11 px-5 transition-all duration-200 hover:scale-[1.02]"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={() => saveAndNavigate("next")}
            disabled={saving || !allQuestionsAnswered}
            className="h-11 bg-[var(--brand-green)] px-6 text-[var(--brand-dark)] hover:bg-[var(--brand-green)]/90 font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
          >
            {saving
              ? "Saving..."
              : sectionNum === 7
                ? "Continue to Financial Context"
                : "Next Section"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentLayout>
  )
}
