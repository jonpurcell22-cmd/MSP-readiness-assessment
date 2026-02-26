"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AssessmentLayout } from "@/components/assessment-layout"
import { SectionStepper } from "@/components/section-stepper"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function ChannelGateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get("id")

  const [choice, setChoice] = useState<"yes" | "no" | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!assessmentId) return
  }, [assessmentId])

  async function handleContinue() {
    if (!assessmentId || choice === null) return
    setSaving(true)

    try {
      const res = await fetch(`/api/assessment/${assessmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section_7_skipped: choice === "no",
        }),
      })

      if (!res.ok) throw new Error("Failed to save")

      if (choice === "no") {
        router.push(`/assessment/financial?id=${assessmentId}`)
      } else {
        router.push(`/assessment/7?id=${assessmentId}`)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!assessmentId) {
    return (
      <AssessmentLayout>
        <p className="py-20 text-center text-muted-foreground">
          Missing assessment. Please start the assessment from the beginning.
        </p>
      </AssessmentLayout>
    )
  }

  return (
    <AssessmentLayout>
      <div className="animate-slide-in">
        <div className="mb-8 flex justify-center">
          <SectionStepper currentSection={7} />
        </div>

        <div className="mb-8 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-editorial text-[var(--brand-green)]">
            Before Section 7
          </p>
          <h1 className="text-2xl font-bold text-[var(--brand-dark)] sm:text-[1.7rem]">
            Existing MSP Program
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Section 7 evaluates the health of your current MSP program. If you don&apos;t have one yet, we&apos;ll skip it and take you straight to your results.
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-4">
          <p className="text-base font-semibold text-[var(--brand-dark)]">
            Do you currently have an existing MSP program in place?
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setChoice("yes")}
              className={cn(
                "flex flex-col items-start rounded-lg border-2 p-5 text-left transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-[var(--brand-green)] hover:bg-[var(--brand-green)]/5 hover:shadow-md",
                choice === "yes"
                  ? "border-l-4 border-[var(--brand-green)] bg-[var(--brand-green)]/8 shadow-md scale-[1.02]"
                  : "border-border bg-card"
              )}
            >
              <span
                className={cn(
                  "text-lg font-bold transition-all",
                  choice === "yes"
                    ? "text-[var(--brand-green)]"
                    : "text-muted-foreground"
                )}
              >
                Yes
              </span>
              <span className="text-sm text-muted-foreground mt-0.5">
                I have existing MSP partners. I&apos;ll answer Section 7.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setChoice("no")}
              className={cn(
                "flex flex-col items-start rounded-lg border-2 p-5 text-left transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-[var(--brand-green)] hover:bg-[var(--brand-green)]/5 hover:shadow-md",
                choice === "no"
                  ? "border-l-4 border-[var(--brand-green)] bg-[var(--brand-green)]/8 shadow-md scale-[1.02]"
                  : "border-border bg-card"
              )}
            >
              <span
                className={cn(
                  "text-lg font-bold transition-all",
                  choice === "no"
                    ? "text-[var(--brand-green)]"
                    : "text-muted-foreground"
                )}
              >
                No
              </span>
              <span className="text-sm text-muted-foreground mt-0.5">
                I&apos;m building from scratch. Skip to financial context.
              </span>
            </button>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/assessment/6?id=${assessmentId}`)}
            disabled={saving}
            className="h-11 px-5 transition-all duration-200 hover:scale-[1.02]"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleContinue}
            disabled={saving || choice === null}
            className="h-11 bg-[var(--brand-green)] px-6 text-[var(--brand-dark)] hover:bg-[var(--brand-green)]/90 font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
          >
            {saving ? "Saving..." : "Continue"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentLayout>
  )
}

export default function ChannelGatePage() {
  return (
    <Suspense
      fallback={
        <AssessmentLayout>
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </AssessmentLayout>
      }
    >
      <ChannelGateContent />
    </Suspense>
  )
}
