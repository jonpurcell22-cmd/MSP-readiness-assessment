"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAssessmentStore } from "@/lib/store";
import { AssessmentSection } from "@/components/AssessmentSectionPage";
import { sectionChannelHealthConfig } from "@/data/section-channel-health";

export function ChannelHealthGate() {
  const router = useRouter();
  const section7Skipped = useAssessmentStore((s) => s.section7Skipped);
  const setSection7Skipped = useAssessmentStore((s) => s.setSection7Skipped);

  // Already chose "No" and continued: show skip message + link to financials
  if (section7Skipped === true) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <p className="font-serif text-lg text-foreground">
              Got it. We&apos;ll score you on the six dimensions that matter for a greenfield build.
            </p>
            <Link
              href="/assessment/financials"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#1a9e44] px-6 py-3 font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4cf37b] focus-visible:ring-offset-2"
            >
              Continue to Your Numbers →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Chose "Yes": show the 5 Section 7 questions
  if (section7Skipped === false) {
    return <AssessmentSection config={sectionChannelHealthConfig} />;
  }

  // Not yet answered: show gate question
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Existing MSP Channel Health
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            If you already have MSP partners, this section matters. If not, skip it and we&apos;ll adjust your score.
          </p>
        </header>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <p className="mb-6 font-serif text-lg font-medium text-foreground">
            Do you have an existing MSP program or informal MSP relationships?
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => {
                setSection7Skipped(false);
              }}
              className="rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4cf37b] focus-visible:ring-offset-2"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setSection7Skipped(true);
                router.push("/assessment/financials");
              }}
              className="rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4cf37b] focus-visible:ring-offset-2"
            >
              No
            </button>
          </div>
        </div>

        <p className="mt-6">
          <Link
            href="/assessment/competitive"
            className="text-sm text-[#1a9e44] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4cf37b] focus-visible:ring-offset-2 rounded"
          >
            ← Back to Section 6
          </Link>
        </p>
      </div>
    </main>
  );
}
