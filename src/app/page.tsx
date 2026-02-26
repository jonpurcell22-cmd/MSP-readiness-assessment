import { AssessmentLayout } from "@/components/assessment-layout"
import { LeadCaptureForm } from "@/components/LeadCaptureForm"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, BarChart3, Target } from "lucide-react"

export default function LandingPage() {
  return (
    <AssessmentLayout>
      {/* Dark hero band */}
      <div className="-mx-6 -mt-8 bg-[var(--brand-dark)] px-6 py-14 text-center sm:py-16">
        <h1 className="mx-auto max-w-[560px] text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
          MSP Channel{" "}
          <span className="text-[var(--brand-green)]">Readiness</span>{" "}
          Assessment
        </h1>
        <p className="mx-auto mt-4 max-w-[480px] text-pretty text-base leading-relaxed text-white/75">
          Evaluate your organization&apos;s readiness to build a profitable MSP
          channel program in under 10 minutes.
        </p>

        {/* Value props with icons */}
        <div className="mx-auto mt-8 flex max-w-[520px] flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Clock className="h-4 w-4 text-[var(--brand-green)]" />
            <span>10 minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <BarChart3 className="h-4 w-4 text-[var(--brand-green)]" />
            <span>Personalized scorecard</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Target className="h-4 w-4 text-[var(--brand-green)]" />
            <span>Competitive analysis</span>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-[500px] text-sm text-white">
          Built by a channel strategist with 10+ years building MSP programs at
          Apple and VMware.
        </p>
      </div>

      {/* Description + Form on subtle grid background */}
      <div className="bg-subtle-grid -mx-6 px-6 py-10">
        <div className="mx-auto flex w-full max-w-[580px] flex-col gap-8">
          <p className="text-center text-sm leading-relaxed text-muted-foreground">
            This assessment covers 7 critical dimensions of channel readiness,
            from pricing and partner economics to executive commitment. You will
            receive a personalized scorecard, competitive analysis, and financial
            projections to guide your channel strategy.
          </p>

          <Card className="overflow-hidden rounded-t-none border-t-[2px] border-t-[#4cf37b] bg-card shadow-lg">
            <CardContent className="p-6 sm:p-8">
              <h2 className="mb-6 text-lg font-semibold text-[var(--brand-dark)]">
                Begin Your Assessment
              </h2>
              <LeadCaptureForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </AssessmentLayout>
  )
}
