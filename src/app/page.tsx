import { AssessmentLayout } from "@/components/assessment-layout"
import { LeadCaptureForm } from "@/components/lead-capture-form"

export default function LandingPage() {
  return (
    <AssessmentLayout>
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-10 pt-6 pb-16">
        {/* Hero text */}
        <div className="flex flex-col gap-4 text-center">
          <h1
            className="text-3xl font-bold sm:text-4xl"
            style={{ color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            MSP Channel{" "}
            <span style={{ color: "#4cf37b" }}>Readiness</span>{" "}
            Assessment
          </h1>
          <p style={{ color: "#8b8b9a", fontSize: 16, lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
            Get a direct diagnosis of your MSP channel readiness from an expert who has built programs at Apple and VMware.
          </p>
        </div>

        {/* Form card */}
        <div
          className="card-dark"
          style={{ padding: "36px 32px" }}
        >
          <h2
            className="font-semibold"
            style={{ color: "#ffffff", fontSize: 17, marginBottom: 24, letterSpacing: "-0.01em" }}
          >
            Get Your Diagnosis
          </h2>
          <LeadCaptureForm />
        </div>
      </div>
    </AssessmentLayout>
  )
}
