"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useAssessmentStore } from "@/lib/store";
import {
  TIER_LABELS,
  TIER_COLORS,
  TIER_INTERPRETATIONS,
  TIER_DEFINITIONS,
  TIER_SCORE_RANGES,
  MAX_SECTION_SCORE,
} from "@/lib/scoring";
import type {
  NarrativeOutput,
  NarrativePart1,
  NarrativePart2,
  NarrativePart3,
} from "@/lib/narrative";
import type { CompetitiveLandscapeOutput } from "@/types/competitive";
import { isCompetitiveLandscapeOutput } from "@/types/competitive";
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

const CALENDLY_USER = "jon-untappedchannelstrategy";
const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ||
  `https://calendly.com/${CALENDLY_USER}`;

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
  const [narrativePart1, setNarrativePart1] = useState<NarrativePart1 | null>(null);
  const [narrativePart2, setNarrativePart2] = useState<NarrativePart2 | null>(null);
  const [narrativePart3, setNarrativePart3] = useState<NarrativePart3 | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [competitiveLandscape, setCompetitiveLandscape] = useState<CompetitiveLandscapeOutput | null>(null);
  const [competitiveFailed, setCompetitiveFailed] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(true);
  const submitAttempted = useRef(false);
  const narrativeFetchStarted = useRef(false);
  const finalizeSent = useRef(false);

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
        if (data.narrative?.executive_summary) {
          setNarrative(data.narrative);
          setEmailSent(data.emailSent !== false);
        } else if (data.id) {
          setAssessmentId(data.id);
        }
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

  // When we have assessmentId and no full narrative yet, fire 3 parallel narrative-part requests
  useEffect(() => {
    if (
      !assessmentId ||
      narrative ||
      narrativeFetchStarted.current ||
      submitStatus !== "success"
    ) {
      return;
    }
    narrativeFetchStarted.current = true;
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
    const opts = {
      method: "POST" as const,
      headers: { "Content-Type": "application/json" },
    };
    const req1 = fetch("/api/generate-narrative", {
      ...opts,
      body: JSON.stringify({ ...payload, part: 1 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.executive_summary) setNarrativePart1(data);
        return data;
      })
      .catch((err) => {
        console.error("Narrative part 1 failed:", err);
        return null;
      });
    const req2 = fetch("/api/generate-narrative", {
      ...opts,
      body: JSON.stringify({ ...payload, part: 2 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.section_interpretations) setNarrativePart2(data);
        return data;
      })
      .catch((err) => {
        console.error("Narrative part 2 failed:", err);
        return null;
      });
    const req3 = fetch("/api/generate-narrative", {
      ...opts,
      body: JSON.stringify({ ...payload, part: 3 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.financial_commentary != null) setNarrativePart3(data);
        return data;
      })
      .catch((err) => {
        console.error("Narrative part 3 failed:", err);
        return null;
      });

    const section6Total = computed?.sectionTotals?.section6 ?? 0;
    const competitiveReq = fetch("/api/generate-competitive", {
      ...opts,
      body: JSON.stringify({
        companyName: contact.companyName,
        companyWebsite: contact.companyWebsite || undefined,
        productCategory: contact.productCategory || "",
        section6Total,
        section6Scores: section6
          ? { q1: section6.q1, q2: section6.q2, q3: section6.q3, q4: section6.q4, q5: section6.q5 }
          : undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (isCompetitiveLandscapeOutput(data)) {
          setCompetitiveLandscape(data);
          return data;
        }
        setCompetitiveFailed(true);
        return null;
      })
      .catch((err) => {
        console.error("Competitive landscape failed:", err);
        setCompetitiveFailed(true);
        return null;
      });

    Promise.all([req1, req2, req3, competitiveReq]).then(([p1, p2, p3, competitive]) => {
      if (p1?.executive_summary && p2?.section_interpretations && p3?.financial_commentary) {
        const merged: NarrativeOutput = {
          executive_summary: p1.executive_summary,
          section_interpretations: p2.section_interpretations,
          financial_commentary: p3.financial_commentary,
          cost_of_delay_narrative: p3.cost_of_delay_narrative,
          roadmap_narrative: p3.roadmap_narrative,
        };
        setNarrative(merged);
        if (!finalizeSent.current && assessmentId) {
          finalizeSent.current = true;
          fetch(`/api/assessments/${assessmentId}/finalize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              narrative: merged,
              competitiveLandscape: isCompetitiveLandscapeOutput(competitive) ? competitive : undefined,
            }),
          })
            .then((r) => r.json())
            .then((data) => setEmailSent(data.emailSent !== false))
            .catch(() => setEmailSent(false));
        }
      }
    });
  }, [
    assessmentId,
    narrative,
    submitStatus,
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
    computed,
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
        <div className="mb-6 text-center">
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

        {/* Tier definition */}
        <div
          className="mb-8 rounded-xl border border-[#1B3A5C]/10 px-5 py-4 text-left"
          style={{ backgroundColor: `${tierColor}18` }}
        >
          <p className="text-sm font-semibold text-[#1B3A5C]">
            {TIER_LABELS[readinessTier]} ({TIER_SCORE_RANGES[readinessTier]})
          </p>
          <p className="mt-2 text-[#1B3A5C]/90 leading-relaxed">
            {TIER_DEFINITIONS[readinessTier]}
          </p>
        </div>

        {/* Part 1: Executive summary + top 3 gaps + top 2 strengths */}
        <section className="mb-8">
          {(() => {
            const part1 = narrativePart1 ?? (narrative ? { executive_summary: narrative.executive_summary, top_3_critical_gaps: [] as string[], top_2_strengths: [] as string[] } : null);
            const part1Loading = !part1 && (submitStatus === "loading" || (submitStatus === "success" && assessmentId));
            if (part1Loading) {
              return (
                <div className="animate-pulse space-y-3 rounded-xl border border-[#1B3A5C]/10 bg-[#1B3A5C]/5 px-5 py-4">
                  <div className="h-4 w-full rounded bg-[#1B3A5C]/20" />
                  <div className="h-4 w-3/4 rounded bg-[#1B3A5C]/20" />
                  <div className="h-4 w-2/3 rounded bg-[#1B3A5C]/20" />
                  <p className="pt-2 text-center text-sm text-[#1B3A5C]/70">Generating your personalized analysis...</p>
                </div>
              );
            }
            if (part1) {
              return (
                <div className="rounded-xl border border-[#1B3A5C]/10 bg-white/80 px-5 py-4 transition-opacity duration-300">
                  <p className="text-center text-lg text-[#1B3A5C]/90">{part1.executive_summary}</p>
                  {(part1.top_3_critical_gaps?.length > 0 || part1.top_2_strengths?.length > 0) && (
                    <div className="mt-5 space-y-4">
                      {part1.top_3_critical_gaps?.length > 0 && (
                        <div>
                          <h3 className="mb-2 text-sm font-semibold text-[#1B3A5C]">Top critical gaps</h3>
                          <ul className="list-inside list-disc space-y-1 text-sm text-[#1B3A5C]/90">
                            {part1.top_3_critical_gaps.map((gap, i) => (
                              <li key={i}>{gap}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {part1.top_2_strengths?.length > 0 && (
                        <div>
                          <h3 className="mb-2 text-sm font-semibold text-[#1B3A5C]">Top strengths to leverage</h3>
                          <ul className="list-inside list-disc space-y-1 text-sm text-[#1B3A5C]/90">
                            {part1.top_2_strengths.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <p className="text-center text-lg text-[#1B3A5C]/90">{TIER_INTERPRETATIONS[readinessTier]}</p>
            );
          })()}
        </section>

        {/* Part 2: Section interpretations */}
        <section className="mb-8">
          {(() => {
            const part2 = narrativePart2 ?? (narrative ? { section_interpretations: narrative.section_interpretations } : null);
            const part2Loading = !part2 && (submitStatus === "loading" || (submitStatus === "success" && assessmentId));
            if (part2Loading) {
              return (
                <div className="animate-pulse space-y-3 rounded-xl border border-[#1B3A5C]/10 bg-[#1B3A5C]/5 px-5 py-4">
                  <div className="h-4 w-1/4 rounded bg-[#1B3A5C]/20" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 rounded bg-[#1B3A5C]/20" />
                    ))}
                  </div>
                  <p className="pt-2 text-center text-sm text-[#1B3A5C]/70">Analyzing each section...</p>
                </div>
              );
            }
            if (part2?.section_interpretations?.length) {
              return (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-opacity duration-300">
                  <h2 className="mb-4 text-lg font-semibold text-[#1B3A5C]">Section-by-section analysis</h2>
                  <div className="space-y-5">
                    {part2.section_interpretations.map((s) => (
                      <div key={s.section_number}>
                        <h3 className="text-sm font-semibold text-[#1B3A5C]">{s.section_name}</h3>
                        <p className="mt-1 text-sm text-[#1B3A5C]/90">{s.interpretation}</p>
                        {s.recommendation && (
                          <p className="mt-2 text-sm font-medium text-[#1A8A7D]">{s.recommendation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </section>

        {/* Part 3: Financial commentary, cost of delay, roadmap */}
        <section className="mb-8">
          {(() => {
            const part3 = narrativePart3 ?? (narrative ? { financial_commentary: narrative.financial_commentary, cost_of_delay_narrative: narrative.cost_of_delay_narrative, roadmap_narrative: narrative.roadmap_narrative } : null);
            const part3Loading = !part3 && (submitStatus === "loading" || (submitStatus === "success" && assessmentId));
            if (part3Loading) {
              return (
                <div className="animate-pulse space-y-3 rounded-xl border border-[#1B3A5C]/10 bg-[#1B3A5C]/5 px-5 py-4">
                  <div className="h-4 w-full rounded bg-[#1B3A5C]/20" />
                  <div className="h-4 w-3/4 rounded bg-[#1B3A5C]/20" />
                  <p className="pt-2 text-center text-sm text-[#1B3A5C]/70">Preparing financial and roadmap insights...</p>
                </div>
              );
            }
            if (part3) {
              return (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-opacity duration-300">
                  <h2 className="mb-4 text-lg font-semibold text-[#1B3A5C]">Financial context & next steps</h2>
                  <div className="space-y-4 text-sm text-[#1B3A5C]/90">
                    <p>{part3.financial_commentary}</p>
                    <p>{part3.cost_of_delay_narrative}</p>
                    <p>{part3.roadmap_narrative}</p>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </section>

        {/* Competitive MSP Landscape */}
        <section className="mb-8">
          {(() => {
            const competitiveLoading =
              !competitiveLandscape &&
              !competitiveFailed &&
              (submitStatus === "loading" || (submitStatus === "success" && assessmentId));
            if (competitiveLoading) {
              return (
                <div className="animate-pulse space-y-3 rounded-xl border border-[#1B3A5C]/10 bg-[#1B3A5C]/5 px-5 py-6">
                  <div className="h-5 w-1/3 rounded bg-[#1B3A5C]/20" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-10 rounded bg-[#1B3A5C]/20" />
                    ))}
                  </div>
                  <p className="pt-2 text-center text-sm text-[#1B3A5C]/70">
                    Researching your competitive landscape...
                  </p>
                </div>
              );
            }
            if (competitiveFailed && !competitiveLandscape) {
              return (
                <div className="rounded-xl border border-[#1B3A5C]/20 bg-[#F4F7FA] px-5 py-4">
                  <h2 className="mb-2 text-lg font-semibold text-[#1B3A5C]">Competitive MSP Landscape</h2>
                  <p className="text-sm text-[#1B3A5C]/90">
                    Competitive landscape research could not be completed. Your consultant can provide this analysis during your deep-dive session.
                  </p>
                </div>
              );
            }
            if (competitiveLandscape) {
              const oppStatus = "No Public MSP Program Found";
              return (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-opacity duration-300">
                  <h2 className="mb-4 text-lg font-semibold text-[#1B3A5C]">Competitive MSP Landscape</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-[#1B3A5C]/80">
                          <th className="pb-2 pr-3 font-medium">Competitor</th>
                          <th className="pb-2 pr-3 font-medium">MSP Program Status</th>
                          <th className="pb-2 pr-3 font-medium">MSP Distributors</th>
                          <th className="pb-2 font-medium">Key Finding</th>
                        </tr>
                      </thead>
                      <tbody className="text-[#1B3A5C]">
                        {competitiveLandscape.competitors.map((c, i) => (
                          <tr
                            key={i}
                            className={
                              c.mspProgramStatus === oppStatus
                                ? "border-b border-gray-100 bg-emerald-50/60"
                                : "border-b border-gray-100 bg-gray-50/50"
                            }
                          >
                            <td className="py-2.5 pr-3 font-medium">
                              {c.website ? (
                                <a
                                  href={c.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#1A8A7D] hover:underline"
                                >
                                  {c.name}
                                </a>
                              ) : (
                                c.name
                              )}
                            </td>
                            <td className="py-2.5 pr-3">{c.mspProgramStatus}</td>
                            <td className="py-2.5 pr-3">
                              {c.distributorPresence?.length ? c.distributorPresence.join(", ") : "—"}
                            </td>
                            <td className="py-2.5 text-[#1B3A5C]/90">{c.programEvidence}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-5 space-y-4 border-t border-gray-200 pt-5">
                    <div>
                      <h3 className="mb-1 text-sm font-semibold text-[#1B3A5C]">Landscape summary</h3>
                      <p className="text-sm text-[#1B3A5C]/90">{competitiveLandscape.landscapeSummary}</p>
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-semibold text-[#1B3A5C]">Distributor opportunity</h3>
                      <p className="text-sm text-[#1B3A5C]/90">{competitiveLandscape.distributorOpportunity}</p>
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-semibold text-[#1B3A5C]">Strategic implication</h3>
                      <p className="text-sm text-[#1B3A5C]/90">{competitiveLandscape.strategicImplication}</p>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </section>

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
          {submitStatus === "loading" && (
            <p className="text-center text-[#1B3A5C]">
              Saving your assessment...
            </p>
          )}
          {submitStatus === "success" && !narrative && assessmentId && (
            <p className="text-center text-[#1B3A5C]">
              Your report will be sent to <strong>{contact.email}</strong> once your personalized analysis is ready.
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
            <>
              <p className="text-center text-[#1B3A5C]">
                {emailSent ? (
                  <>Your full report has been sent to <strong>{contact.email}</strong>. Check your inbox for a detailed breakdown with financial projections and a customized roadmap.</>
                ) : (
                  <>Your results are saved. We couldn&apos;t send the email right now; we&apos;ll follow up at <strong>{contact.email}</strong>.</>
                )}
              </p>
              {!emailSent && (
                <p className="mt-2 text-center text-sm text-amber-700">
                  Check spam or contact{" "}
                  <a href="mailto:jon@untappedchannelstrategy.com" className="text-[#1A8A7D] hover:underline">jon@untappedchannelstrategy.com</a> if you need your report.
                </p>
              )}
            </>
          )}
          {(submitStatus === "success" || submitStatus === "loading") && (
            <>
              <div className="flex flex-col items-center gap-4 pt-2">
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full max-w-sm shrink-0 rounded-lg bg-[#1A8A7D] px-6 py-3.5 text-center font-semibold text-white no-underline shadow-sm transition-colors hover:bg-[#157a6e] focus:outline-none focus:ring-2 focus:ring-[#1A8A7D] focus:ring-offset-2 sm:w-auto"
                >
                  Book a Complimentary Deep-Dive Assessment
                </a>
              </div>
              <p className="mt-4 text-center text-sm text-[#1B3A5C]/70">
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
