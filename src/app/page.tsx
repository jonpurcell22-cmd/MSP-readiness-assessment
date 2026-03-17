import { AssessmentLayout } from "@/components/assessment-layout"
import { LeadCaptureForm } from "@/components/lead-capture-form"
import { Card, CardContent } from "@/components/ui/card"

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
          Get a direct diagnosis of your MSP channel readiness from an expert who has built programs at Apple and VMware.
        </p>
      </div>

      {/* Description + Form on subtle grid background */}
      <div className="bg-subtle-grid -mx-6 px-6 py-10">
        <div className="mx-auto flex w-full max-w-[580px] flex-col gap-8">
          <p className="text-center text-sm leading-relaxed text-muted-foreground">
            Answer a few targeted questions and get a direct, expert diagnosis of where your MSP channel program stands — and what's blocking revenue.
          </p>

          <Card className="overflow-hidden rounded-t-none border-t-[2px] border-t-[#4cf37b] bg-card shadow-lg">
            <CardContent className="p-6 sm:p-8">
              <h2 className="mb-6 text-lg font-semibold text-[var(--brand-dark)]">
                Get Your Diagnosis
              </h2>
              <LeadCaptureForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </AssessmentLayout>
  )
}
