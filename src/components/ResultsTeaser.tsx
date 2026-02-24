"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useAssessmentStore } from "@/lib/store";
import {
  TIER_LABELS,
  TIER_COLORS,
  TIER_INTERPRETATIONS,
  MAX_SECTION_SCORE,
} from "@/lib/scoring";
import type { NarrativeOutput } from "@/lib/narrative";
import { getThreeYearProjection, getCostOfDelay } from "@/lib/pdf-financials";

/** Format dollar amount with commas and currency symbol. */
function formatDollars(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
}

const SECTION_LABELS: Record<number, string> = {
  1: "Product Architecture",
  2: "Pricing & Economics",
  3: "Organization & GTM",
  4: "Partner Ecosystem",
  5: "Enablement",
  6: "Competitive Landscape",
  7: "Channel Health",
};

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || "#";

type SubmitStatus = "idle" | "loading" | "success" | "error";

export function ResultsTeaser() {
  const contact = useAssessmentStore((s) => s.contact);
  const financials = useAssessmentStore((s) => s.financials);
  const section1 = useAssessmentStore((s) => s.section1);
  const section2 = useAssessmentStore((s) => s.section2);
  const section3 = useAssessmentStore((s) => s.section3);
  const section4 = useAssessmentStore((s) => s.section4);
  const section5 = useAssessmentStore((s) => s.section5);
  const section6 = useAssessmentStore((s) => s.section6);
  const section7 = useAssessmentStore((s) => s.section7);
  const section7Skipped = useAssessmentStore((s) => s.section7Skipped);
  const computed = useAssessmentStore((s) => s.computed);
  const setComputed = useAssessmentStore((s) => s.setComputed);
  const [displayScore, setDisplayScore] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<NarrativeOutput | null>(null);
  const submitAttempted = useRef(false);

  // Ensure we have computed results (e.g. user landed here via direct URL)
  useEffect(() => {
    if (!computed) setComputed();
  }, [computed, setComputed]);

  // Submit assessment to API once when we have full data
  useEffect(() => {
    if (
      !computed ||
      submitStatus !== "idle" ||
      submitAttempted.current ||
      section7Skipped === null
    )
      return;
    submitAttempted.current = true;
    setSubmitStatus("loading");

    const payload = {
      contact,
      financials,
      section1,
      section2,
      section3,
      section4,
      section5,
      section6,
      section7,
      section7Skipped: section7Skipped === true,
      computed,
    };

    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) return Promise.reject(new Error(data?.error ?? res.statusText));
        setSubmitError(null);
        setSubmitStatus("success");
        if (data.narrative?.executive_summary) setNarrative(data.narrative);
      })
      .catch((err) => {
        console.error("Submit failed:", err);
        setSubmitError(err instanceof Error ? err.message : "Something went wrong");
        setSubmitStatus("error");
        submitAttempted.current = false;
      });
  }, [
    computed,
    contact,
    financials,
    section1,
    section2,
    section3,
    section4,
    section5,
    section6,
    section7,
    section7Skipped,
    submitStatus,
  ]);

  // Count-up animation for score
  const targetScore = computed?.overallScore ?? 0;
  useEffect(() => {
    if (targetScore === 0) return;
    const duration = 1200;
    const steps = 24;
    const stepMs = duration / steps;
    const increment = targetScore / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setDisplayScore(targetScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, stepMs);
    return () => clearInterval(timer);
  }, [targetScore]);

  if (!computed) {
    return (
      <main className="min-h-screen bg-[#F4F7FA] px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[#1B3A5C]/80">Loading your results...</p>
          <Link href="/assessment/financials" className="mt-4 inline-block text-[#1A8A7D] hover:underline">
            ← Back to Your Numbers
          </Link>
        </div>
      </main>
    );
  }

  const { sectionTotals, overallScore, readinessTier, redFlags } = computed;
  const tierColor = TIER_COLORS[readinessTier];

  // Financial inputs for projection and cost-of-delay (match pdf-financials)
  const financialInputs = useMemo(
    () => ({
      arr: financials.arr ?? null,
      acv: financials.acv ?? null,
      customerCount: financials.customerCount ?? null,
      cac: financials.cac ?? null,
      salesCycleDays: financials.salesCycleDays ?? null,
    }),
    [financials.arr, financials.acv, financials.customerCount, financials.cac, financials.salesCycleDays]
  );
  const projection = useMemo(() => getThreeYearProjection(financialInputs), [financialInputs]);
  const costOfDelay = useMemo(() => getCostOfDelay(financialInputs), [financialInputs]);

  // Resolved CAC for display (same benchmark as getCostOfDelay)
  const displayCac =
    financials.cac ??
    (financials.customerCount && financials.arr
      ? Math.max(5000, (financials.arr * 0.15) / financials.customerCount)
      : null);

  // Sections to show in bar chart (1-6 always, 7 if not skipped)
  const sectionsForChart: { num: number; total: number }[] = [
    { num: 1, total: sectionTotals.section1 },
    { num: 2, total: sectionTotals.section2 },
    { num: 3, total: sectionTotals.section3 },
    { num: 4, total: sectionTotals.section4 },
    { num: 5, total: sectionTotals.section5 },
    { num: 6, total: sectionTotals.section6 },
  ];
  if (sectionTotals.section7 !== null) {
    sectionsForChart.push({ num: 7, total: sectionTotals.section7 });
  }

  return (
    <main className="min-h-screen bg-[#F4F7FA] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        {/* Overall score */}
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-[#1B3A5C]/70">
            Your Readiness Score
          </p>
          <p
            className="mt-2 text-5xl font-bold tabular-nums sm:text-6xl"
            style={{ color: tierColor }}
          >
            {displayScore}
          </p>
          <span
            className="mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white"
            style={{ backgroundColor: tierColor }}
          >
            {TIER_LABELS[readinessTier]}
          </span>
        </div>

        {/* AI summary or tier interpretation */}
        <p className="mb-8 text-center text-lg text-[#1B3A5C]/90">
          {narrative?.executive_summary ?? (
            submitStatus === "loading" || submitStatus === "idle"
              ? "Generating your personalized summary..."
              : TIER_INTERPRETATIONS[readinessTier]
          )}
        </p>

        {/* Section bar chart */}
        <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1B3A5C]">
            Section Scores
          </h2>
          <div className="space-y-4">
            {sectionsForChart.map(({ num, total }) => {
              const pct = MAX_SECTION_SCORE > 0 ? (total / MAX_SECTION_SCORE) * 100 : 0;
              return (
                <div key={num}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-[#1B3A5C]">
                      {SECTION_LABELS[num]}
                    </span>
                    <span className="text-[#1B3A5C]/70">
                      {total}/{MAX_SECTION_SCORE}
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: tierColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Financial projections */}
        {projection && (
          <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#1B3A5C]">
              3-Year Channel Revenue Projection
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-[#1B3A5C]/80">
                    <th className="pb-2 pr-4 font-medium">Metric</th>
                    <th className="pb-2 pr-4 font-medium text-right">Year 1</th>
                    <th className="pb-2 pr-4 font-medium text-right">Year 2</th>
                    <th className="pb-2 font-medium text-right">Year 3</th>
                  </tr>
                </thead>
                <tbody className="text-[#1B3A5C]">
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4">Active MSP Partners</td>
                    <td className="py-2 pr-4 text-right">{projection.year1.partners}</td>
                    <td className="py-2 pr-4 text-right">{projection.year2.partners}</td>
                    <td className="py-2 text-right">{projection.year3.partners}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4">Avg Clients per Partner</td>
                    <td className="py-2 pr-4 text-right">{projection.year1.clientsPerPartner}</td>
                    <td className="py-2 pr-4 text-right">{projection.year2.clientsPerPartner}</td>
                    <td className="py-2 text-right">{projection.year3.clientsPerPartner}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4">Total MSP Clients</td>
                    <td className="py-2 pr-4 text-right">{projection.year1.totalClients}</td>
                    <td className="py-2 pr-4 text-right">{projection.year2.totalClients}</td>
                    <td className="py-2 text-right">{projection.year3.totalClients}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4">MSP Revenue</td>
                    <td className="py-2 pr-4 text-right">{formatDollars(projection.year1.mspRevenue)}</td>
                    <td className="py-2 pr-4 text-right">{formatDollars(projection.year2.mspRevenue)}</td>
                    <td className="py-2 text-right">{formatDollars(projection.year3.mspRevenue)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">MSP Revenue as % of Current ARR</td>
                    <td className="py-2 pr-4 text-right">{projection.year1.mspRevenuePctArr.toFixed(0)}%</td>
                    <td className="py-2 pr-4 text-right">{projection.year2.mspRevenuePctArr.toFixed(0)}%</td>
                    <td className="py-2 text-right">{projection.year3.mspRevenuePctArr.toFixed(0)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CAC reduction estimate */}
            <div className="mt-5 rounded-xl bg-[#F4F7FA] p-4">
              <h3 className="mb-2 text-sm font-semibold text-[#1B3A5C]">CAC Reduction Estimate</h3>
              <p className="text-sm text-[#1B3A5C]/90">
                MSP channel typically reduces CAC by 40–60%.{" "}
                {displayCac != null ? (
                  <>
                    At your current CAC of {formatDollars(displayCac)}, that could mean{" "}
                    {formatDollars(displayCac * 0.4)}–{formatDollars(displayCac * 0.6)} saved per new
                    customer acquired through the channel.
                  </>
                ) : (
                  "With ARR and customer count, we can show your potential savings per customer."
                )}
              </p>
            </div>

            {/* Cost of delay summary */}
            {costOfDelay && (
              <div className="mt-4 rounded-xl bg-[#F4F7FA] p-4">
                <h3 className="mb-2 text-sm font-semibold text-[#1B3A5C]">Cost of Delay (12-month wait)</h3>
                <p className="text-sm text-[#1B3A5C]/90">
                  If you wait 12 months, Year 1 MSP revenue ({formatDollars(costOfDelay.year1MspRevenueLost)})
                  shifts to Year 2. Every quarter without an MSP channel costs approximately{" "}
                  {formatDollars(costOfDelay.cacSavingsPerQuarter)} in higher acquisition costs and{" "}
                  {formatDollars(costOfDelay.year1MspRevenueLost / 4)} in unrealized partner revenue.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Red flags */}
        {redFlags.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-lg font-semibold text-[#1B3A5C]">
              Critical Items
            </h2>
            <div className="space-y-3">
              {redFlags.map((flag, i) => (
                <div
                  key={i}
                  className="rounded-xl border-l-4 border-red-500 bg-red-50/50 p-4 text-sm text-[#1B3A5C]"
                >
                  {flag}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTAs */}
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {(submitStatus === "idle" || submitStatus === "loading") && (
            <p className="text-center text-[#1B3A5C]">
              Generating your report...
            </p>
          )}
          {submitStatus === "error" && (
            <div className="rounded-xl border-l-4 border-red-500 bg-red-50/50 p-4 text-sm text-[#1B3A5C]">
              <p className="font-medium">We couldn&apos;t save your assessment.</p>
              {submitError && <p className="mt-1 text-[#1B3A5C]/80">{submitError}</p>}
              <p className="mt-1">Please try again or contact{" "}
                <a href="mailto:jon@untappedchannelstrategy.com" className="text-[#1A8A7D] hover:underline">jon@untappedchannelstrategy.com</a>.
              </p>
              <button
                type="button"
                onClick={() => {
                  submitAttempted.current = false;
                  setSubmitStatus("idle");
                  setSubmitError(null);
                }}
                className="mt-3 rounded-lg bg-[#1A8A7D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#157a6e]"
              >
                Try again
              </button>
            </div>
          )}
          {submitStatus === "success" && (
            <p className="text-center text-[#1B3A5C]">
              Your full report has been sent to <strong>{contact.email}</strong>. Check your inbox for a detailed breakdown with financial projections and a customized roadmap.
            </p>
          )}
          {(submitStatus === "success" || submitStatus === "loading") && (
            <>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-[#1A8A7D] px-6 py-3 font-semibold text-white hover:bg-[#157a6e] focus:outline-none focus:ring-2 focus:ring-[#1A8A7D] focus:ring-offset-2"
                >
                  Book a Complimentary Deep-Dive Assessment
                </a>
              </div>
              <p className="text-center text-sm text-[#1B3A5C]/70">
                Didn&apos;t receive it? Check spam or contact{" "}
                <a
                  href="mailto:jon@untappedchannelstrategy.com"
                  className="text-[#1A8A7D] hover:underline"
                >
                  jon@untappedchannelstrategy.com
                </a>
              </p>
            </>
          )}
        </div>

        <p className="mt-8 text-center">
          <Link href="/" className="text-sm text-[#1A8A7D] hover:underline">
            ← Back to start
          </Link>
        </p>
      </div>
    </main>
  );
}
