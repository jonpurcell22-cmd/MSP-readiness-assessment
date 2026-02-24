"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAssessmentStore } from "@/lib/store";
import { AssessmentSection } from "@/components/AssessmentSection";
import { sectionChannelHealthConfig } from "@/data/section-channel-health";
import {
  TIER_LABELS,
  TIER_COLORS,
  TIER_INTERPRETATIONS,
  MAX_SECTION_SCORE,
} from "@/lib/scoring";
import type { ReadinessTier } from "@/types/assessment";

const SECTION_LABELS: Record<number, string> = {
  1: "Product Architecture",
  2: "Pricing & Economics",
  3: "Organization & GTM",
  4: "Partner Ecosystem",
  5: "Enablement",
  6: "Competitive Landscape",
  7: "Channel Health",
};

export function ChannelHealthGate() {
  const router = useRouter();
  const section7Skipped = useAssessmentStore((s) => s.section7Skipped);
  const setSection7Skipped = useAssessmentStore((s) => s.setSection7Skipped);

  // Already chose "No" and continued: show skip message + link to financials
  if (section7Skipped === true) {
    return (
      <main className="min-h-screen bg-[#F4F7FA] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-lg text-[#1B3A5C]">
              Got it. We&apos;ll score you on the six dimensions that matter for a greenfield build.
            </p>
            <Link
              href="/assessment/financials"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#1A8A7D] px-6 py-3 font-semibold text-white hover:bg-[#157a6e]"
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
    <main className="min-h-screen bg-[#F4F7FA] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#1B3A5C] sm:text-3xl">
            Existing MSP Channel Health
          </h1>
          <p className="mt-2 text-[#1B3A5C]/80">
            If you already have MSP partners, this section matters. If not, skip it and we&apos;ll adjust your score.
          </p>
        </header>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="mb-6 text-lg font-medium text-[#1B3A5C]">
            Do you have an existing MSP program or informal MSP relationships?
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => {
                setSection7Skipped(false);
                // Stay on page; re-render will show the 5 questions
              }}
              className="rounded-lg border-2 border-[#1A8A7D] bg-[#1A8A7D]/10 px-6 py-3 font-semibold text-[#1B3A5C] hover:bg-[#1A8A7D]/20"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setSection7Skipped(true);
                router.push("/assessment/financials");
              }}
              className="rounded-lg border-2 border-gray-200 bg-white px-6 py-3 font-medium text-[#1B3A5C] hover:border-gray-300 hover:bg-gray-50"
            >
              No
            </button>
          </div>
        </div>

        <p className="mt-6">
          <Link href="/assessment/competitive" className="text-sm text-[#1A8A7D] hover:underline">
            ← Back to Section 6
          </Link>
        </p>
      </div>
    </main>
  );
}
