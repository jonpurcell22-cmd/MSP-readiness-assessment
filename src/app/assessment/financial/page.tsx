"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AssessmentLayout } from "@/components/assessment-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateSectionScores, calculateTotalScore, getTier } from "@/lib/scoring"
import { ChevronLeft, ChevronRight } from "lucide-react"

function FinancialContextContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get("id")

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [section7Skipped, setSection7Skipped] = useState<boolean | null>(null)

  const [currentArr, setCurrentArr] = useState("")
  const [avgContractValue, setAvgContractValue] = useState("")
  const [estimatedCac, setEstimatedCac] = useState("")
  const [annualNewCustomers, setAnnualNewCustomers] = useState("")

  useEffect(() => {
    if (!assessmentId) return
    fetch(`/api/assessment/${assessmentId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setSection7Skipped(!!data.section_7_skipped))
      .catch(() => {})
  }, [assessmentId])

  function formatDollar(val: string): string {
    const num = val.replace(/[^\d]/g, "")
    if (!num) return ""
    return new Intl.NumberFormat("en-US").format(Number(num))
  }

  async function handleComplete() {
    if (!assessmentId) return
    setSaving(true)
    setError("")

    try {
      // Fetch current assessment to get answers
      const res = await fetch(`/api/assessment/${assessmentId}`)
      if (!res.ok) throw new Error("Failed to fetch assessment")
      const assessment = await res.json()

      // Calculate scores (respect section_7_skipped for greenfield)
      let sectionScores = calculateSectionScores(assessment.answers || {})
      if (assessment.section_7_skipped === true && sectionScores) {
        sectionScores = { ...sectionScores, section7: null }
      }
      const totalScore = calculateTotalScore(sectionScores)
      const tier = getTier(totalScore)

      // Build financial data as a JSONB object stored in answers
      const financialData = {
        current_arr: Number(currentArr.replace(/[^\d]/g, "")) || 0,
        avg_contract_value: Number(avgContractValue.replace(/[^\d]/g, "")) || 0,
        estimated_cac: Number(estimatedCac.replace(/[^\d]/g, "")) || 0,
        annual_new_customers: Number(annualNewCustomers) || 0,
      }

      const updatedAnswers = {
        ...assessment.answers,
        financial: financialData,
      }

      // Save everything
      const updateRes = await fetch(`/api/assessment/${assessmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: updatedAnswers,
          section_scores: sectionScores,
          total_score: totalScore,
          tier,
          completed_at: new Date().toISOString(),
        }),
      })

      if (!updateRes.ok) {
        const errBody = await updateRes.json().catch(() => ({}))
        throw new Error((errBody as { error?: string })?.error ?? "Failed to save results")
      }

      router.push(`/assessment/results/${assessmentId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.")
      setSaving(false)
    }
  }

  const progressPct = Math.round((7.5 / 8) * 100)

  return (
    <AssessmentLayout
      rightContent={
        <span className="text-sm text-muted-foreground">
          Financial Context
        </span>
      }
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[var(--brand-green)] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-[600px]">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[var(--brand-dark)]">
            Financial Context
          </h1>
          <p className="text-muted-foreground">
            These optional inputs help us generate personalized financial
            projections for your channel strategy. All fields are optional.
          </p>
        </div>

        <Card className="border-border bg-[var(--brand-subtle)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-[var(--brand-dark)]">
              Your Current Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="arr">Current Annual Recurring Revenue (ARR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="arr"
                  className="pl-7"
                  value={currentArr}
                  onChange={(e) => setCurrentArr(formatDollar(e.target.value))}
                  placeholder="5,000,000"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your total annual recurring revenue from all sources.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="acv">Average Contract Value (ACV)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="acv"
                  className="pl-7"
                  value={avgContractValue}
                  onChange={(e) =>
                    setAvgContractValue(formatDollar(e.target.value))
                  }
                  placeholder="12,000"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                The average annual value of a new customer contract.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cac">Estimated Customer Acquisition Cost (CAC)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="cac"
                  className="pl-7"
                  value={estimatedCac}
                  onChange={(e) =>
                    setEstimatedCac(formatDollar(e.target.value))
                  }
                  placeholder="5,000"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Total cost to acquire one new customer through direct sales.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="annual-customers">
                Annual New Customer Additions
              </Label>
              <Input
                id="annual-customers"
                type="number"
                value={annualNewCustomers}
                onChange={(e) => setAnnualNewCustomers(e.target.value)}
                placeholder="40"
              />
              <p className="text-xs text-muted-foreground">
                Total number of new customers acquired per year.
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() =>
              router.push(
                section7Skipped
                  ? `/assessment/channel-gate?id=${assessmentId}`
                  : `/assessment/7?id=${assessmentId}`
              )
            }
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleComplete}
            disabled={saving}
            className="bg-[var(--brand-green)] text-[var(--brand-dark)] hover:bg-[var(--brand-green)]/90 font-semibold"
          >
            {saving ? "Calculating Results..." : "View My Results"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentLayout>
  )
}

export default function FinancialContextPage() {
  return (
    <Suspense fallback={<AssessmentLayout rightContent={<span className="text-sm text-muted-foreground">Financial Context</span>}><div className="mx-auto max-w-[600px] animate-pulse rounded-lg bg-muted p-8" /></AssessmentLayout>}>
      <FinancialContextContent />
    </Suspense>
  )
}
