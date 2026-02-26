"use client";

import { AssessmentLayout } from "@/components/assessment-layout";
import { TierBadge } from "@/components/tier-badge";
import { ScoreGauge } from "@/components/score-gauge";
import { ResultsRadarChart } from "@/components/results-radar-chart";
import { SectionResultCard } from "@/components/section-result-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sections } from "@/lib/assessment-data";
import { TIER_LABELS, toPercentageScore } from "@/lib/scoring";
import type { Tier } from "@/lib/scoring";
import type { ProjectionsResult } from "@/lib/financial-projections";
import { formatCurrency } from "@/lib/financial-projections";
import { Calendar, Mail, FileDown, Compass } from "lucide-react";

interface ResultsContentProps {
  assessment: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    answers: Record<string, unknown> & {
      financial?: Record<string, unknown>;
      [key: string]: unknown;
    };
    section_scores: Record<string, number>;
    total_score: number;
    tier: Tier;
  };
  tier: Tier;
  tierDescription: string;
  executiveSummary: string;
  sectionInterpretations: Record<string, string>;
  competitiveLandscape: string;
  projections: ProjectionsResult;
  /** When set, show "Generating your personalized analysis..." skeletons in AI sections. */
  aiLoading?: {
    executiveSummary?: boolean;
    sectionAnalysis?: boolean;
    competitive?: boolean;
  };
}

const AI_SKELETON_MESSAGE = "Generating your personalized analysis. This may take up to 30 seconds...";

export function ResultsContent({
  assessment,
  tier,
  tierDescription,
  executiveSummary,
  sectionInterpretations,
  competitiveLandscape,
  projections,
  aiLoading,
}: ResultsContentProps) {
  const tierLabel = TIER_LABELS[tier];

  const yearlyProjections = [
    {
      year: 1,
      newPartners: projections.year1.partners,
      avgDealsPerPartner: Math.round(projections.year1.totalClients / projections.year1.partners) || 0,
      channelDeals: projections.year1.totalClients,
      channelRevenue: projections.year1.revenue,
      netSavings: Math.round(projections.year1.revenue * 0.15),
      cumulativeRevenue: projections.year1.revenue,
    },
    {
      year: 2,
      newPartners: projections.year2.partners,
      avgDealsPerPartner: Math.round(projections.year2.totalClients / projections.year2.partners) || 0,
      channelDeals: projections.year2.totalClients,
      channelRevenue: projections.year2.revenue,
      netSavings: Math.round(projections.year2.revenue * 0.15),
      cumulativeRevenue: projections.year1.revenue + projections.year2.revenue,
    },
    {
      year: 3,
      newPartners: projections.year3.partners,
      avgDealsPerPartner: Math.round(projections.year3.totalClients / projections.year3.partners) || 0,
      channelDeals: projections.year3.totalClients,
      channelRevenue: projections.year3.revenue,
      netSavings: Math.round(projections.year3.revenue * 0.15),
      cumulativeRevenue:
        projections.year1.revenue + projections.year2.revenue + projections.year3.revenue,
    },
  ];

  const costOfDelay = Math.round(projections.year1.revenue / 4);
  const diyEstimate = {
    cost: Math.round(projections.year1.revenue * 0.2),
    timeMonths: 12,
    risk: "Longer time to revenue; risk of misaligned program design without expert input.",
  };
  const expertEstimate = {
    cost: Math.round(projections.year1.revenue * 0.08),
    timeMonths: 4,
    risk: "Faster launch with playbook and recruitment strategy; lower risk of false starts.",
  };

  return (
    <AssessmentLayout>
      <div className="font-sans flex max-w-[900px] flex-col gap-14 mx-auto w-full">
        {/* Score + tier at top – clean centered layout */}
        <div className="animate-fade-in-up flex flex-col items-center gap-6 pt-4 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-editorial text-[#333333]/70">
              Assessment Results
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#333333] sm:text-3xl">
              Your MSP Channel Readiness Score
            </h1>
            <p className="mt-1 text-[#333333]/80">
              {assessment.company_name} | {assessment.contact_name}
            </p>
          </div>

          <ScoreGauge
            score={toPercentageScore(assessment.total_score)}
            max={100}
            tier={tierLabel}
          />
          <TierBadge tier={tierLabel} className="px-5 py-2 text-base" />

          <Button
            variant="outline"
            className="border-[#4cf37b] font-semibold text-[#333333] transition-all hover:scale-[1.02] hover:bg-[#4cf37b]/10"
            onClick={() => window.print()}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF
          </Button>

          {/* Tier definition – card with light #F4F4F4 background */}
          <Card className="w-full max-w-[560px] rounded-xl border-0 bg-[#F4F4F4] shadow-sm">
            <CardContent className="px-5 py-4">
              <p className="text-sm leading-relaxed text-[#333333]/80">
                {tierDescription}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Section scores – card with horizontal green bars */}
        <div className="animate-fade-in-up animate-delay-100">
          <Card className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#333333]">
                Channel Readiness Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResultsRadarChart sectionScores={assessment.section_scores} />
              <div className="mt-6 flex flex-col gap-3">
                {sections.map((section) => {
                  const s = assessment.section_scores?.[section.id] ?? 0;
                  const pct = Math.round((s / 25) * 100);
                  return (
                    <div key={section.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#333333]">{section.title}</span>
                        <span className="text-sm font-semibold tabular-nums text-[#333333]">{s}/25</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E5E5]">
                        <div
                          className="h-full rounded-full bg-[#4cf37b] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executive summary – card with green left border */}
        <div className="animate-fade-in-up animate-delay-200">
          <Card className="rounded-xl border-l-4 border-l-[#4cf37b] border border-[#E5E5E5] bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#333333]">
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiLoading?.executiveSummary ? (
                <div className="flex flex-col gap-3">
                  <div className="animate-skeleton-pulse h-3 w-full rounded bg-[#E5E5E5]" />
                  <div className="animate-skeleton-pulse h-3 w-full rounded bg-[#E5E5E5]" />
                  <div className="animate-skeleton-pulse h-3 w-4/5 rounded bg-[#E5E5E5]" />
                  <p className="mt-2 text-sm italic text-[#333333]/70">
                    {AI_SKELETON_MESSAGE}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {executiveSummary
                    ? executiveSummary.split("\n\n").map((paragraph, i) => (
                        <p
                          key={i}
                          className="text-sm leading-relaxed text-[#333333]/80"
                        >
                          {paragraph}
                        </p>
                      ))
                    : (
                        <p className="text-sm italic text-[#333333]/60">
                          Your executive summary will appear here once your personalized analysis is ready.
                        </p>
                      )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section-by-section – each in own card, green left border, name, bar, AI interpretation */}
        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-[#333333] sm:text-2xl">
            Section Analysis
          </h2>
          {aiLoading?.sectionAnalysis ? (
            <>
              {sections.map((_, i) => (
                <Card key={i} className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-3">
                      <div className="animate-skeleton-pulse h-5 w-2/3 rounded bg-[#E5E5E5]" />
                      <div className="animate-skeleton-pulse h-2.5 w-full rounded-full bg-[#E5E5E5]" />
                      <div className="mt-4 space-y-2">
                        <div className="animate-skeleton-pulse h-3 w-full rounded bg-[#E5E5E5]" />
                        <div className="animate-skeleton-pulse h-3 w-full rounded bg-[#E5E5E5]" />
                        <div className="animate-skeleton-pulse h-3 w-3/4 rounded bg-[#E5E5E5]" />
                      </div>
                    </div>
                    <p className="mt-3 text-sm italic text-[#333333]/70">
                      {AI_SKELETON_MESSAGE}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            sections.map((section, i) => (
              <div
                key={section.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <SectionResultCard
                  section={section}
                  score={assessment.section_scores?.[section.id] ?? 0}
                  interpretation={sectionInterpretations[section.id] ?? ""}
                  answers={
                    (assessment.answers?.[section.id] as Record<string, number>) ??
                    {}
                  }
                />
              </div>
            ))
          )}
        </div>

        {/* Competitive landscape – card */}
        <Card className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#333333] sm:text-xl">
              <Compass className="h-5 w-5 text-[#4cf37b]" />
              Competitive Landscape
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiLoading?.competitive ? (
              <>
                <div className="space-y-2">
                  <div className="animate-skeleton-pulse h-3 w-full rounded bg-[#E5E5E5]" />
                  <div className="animate-skeleton-pulse h-3 w-full rounded bg-[#E5E5E5]" />
                  <div className="animate-skeleton-pulse h-3 w-4/5 rounded bg-[#E5E5E5]" />
                </div>
                <p className="mt-3 text-sm italic text-[#333333]/70">
                  {AI_SKELETON_MESSAGE}
                </p>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-[#333333]/80">
                {competitiveLandscape}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Financial projections – clean table card, alternating #F4F4F4 rows */}
        <Card className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#333333]">
              3-Year Channel Revenue Projections
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-8">
            <div className="overflow-x-auto rounded-lg border border-[#E5E5E5]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F4F4F4]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-editorial text-[#333333]">
                      Metric
                    </th>
                    {yearlyProjections.map((yp) => (
                      <th
                        key={yp.year}
                        className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-editorial text-[#333333]"
                      >
                        Year {yp.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "New Partners", values: yearlyProjections.map((yp) => yp.newPartners), fmt: (v: number) => String(v) },
                    { label: "Avg Deals / Partner", values: yearlyProjections.map((yp) => yp.avgDealsPerPartner), fmt: (v: number) => String(v) },
                    { label: "Channel Deals", values: yearlyProjections.map((yp) => yp.channelDeals), fmt: (v: number) => String(v) },
                    { label: "Channel Revenue", values: yearlyProjections.map((yp) => yp.channelRevenue), fmt: formatCurrency },
                    { label: "CAC Savings", values: yearlyProjections.map((yp) => yp.netSavings), fmt: formatCurrency },
                  ].map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-[#F4F4F4]"}>
                      <td className="px-4 py-3 text-[#333333]/80">
                        {row.label}
                      </td>
                      {row.values.map((v, i) => (
                        <td
                          key={i}
                          className={`px-4 py-3 text-right text-[#333333] ${row.label === "Channel Revenue" ? "font-semibold" : "font-medium"}`}
                        >
                          {row.fmt(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[#4cf37b] bg-[#4cf37b]/5">
                    <td className="px-4 py-3 font-semibold text-[#333333]">
                      Cumulative Revenue
                    </td>
                    {yearlyProjections.map((yp) => (
                      <td
                        key={yp.year}
                        className="px-4 py-3 text-right font-bold text-[#333333]"
                      >
                        {formatCurrency(yp.cumulativeRevenue)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <Card className="rounded-xl border-0 bg-[#F4F4F4] shadow-none">
              <CardContent className="px-5 py-5">
                <p className="text-sm font-semibold text-[#333333]">
                  Cost of Delay
                </p>
                <p className="mt-1 text-3xl font-bold text-[#333333]">
                  {formatCurrency(costOfDelay)}
                  <span className="ml-2 text-sm font-normal text-[#333333]/80">
                    per quarter in missed channel revenue
                  </span>
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Card className="rounded-xl border border-[#E5E5E5] shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-[#333333]">
                    DIY Approach
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-3xl font-bold text-[#333333]">
                    {formatCurrency(diyEstimate.cost)}
                  </p>
                  <p className="text-sm text-[#333333]/80">
                    {diyEstimate.timeMonths} months to launch
                  </p>
                  <p className="text-xs leading-relaxed text-[#333333]/70">
                    {diyEstimate.risk}
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-2 border-[#4cf37b] bg-[#4cf37b]/5 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-[#333333]">
                    Expert-Guided Approach
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-3xl font-bold text-[#333333]">
                    {formatCurrency(expertEstimate.cost)}
                  </p>
                  <p className="text-sm text-[#333333]">
                    {expertEstimate.timeMonths} months to launch
                  </p>
                  <p className="text-xs leading-relaxed text-[#333333]/70">
                    {expertEstimate.risk}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* CTA – dark #333333 band, white text */}
        <div className="-mx-6 -mb-8 bg-[#333333] px-6 py-14 text-center sm:py-16">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to go deeper?
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-sm leading-relaxed text-white/80">
            I offer a complimentary 90-minute deep-dive assessment where we walk through each dimension in detail and build a customized action plan. No cost, no obligation.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              className="h-14 bg-[#4cf37b] px-10 text-base font-bold text-[#333333] shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[#4cf37b]/90 hover:shadow-xl"
              asChild
            >
              <a
                href={process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendly.com/jon-untappedchannelstrategy"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Your Complimentary Deep-Dive Assessment
              </a>
            </Button>
          </div>
          <div className="mt-10 flex flex-col items-center gap-1 text-sm text-white/70">
            <p className="font-semibold text-white">Jon Purcell</p>
            <p>Untapped Channel Strategy</p>
          </div>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
            <a
              href="mailto:jon@untappedchannelstrategy.com"
              className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4" />
              jon@untappedchannelstrategy.com
            </a>
            <a
              href="https://untappedchannelstrategy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              untappedchannelstrategy.com
            </a>
          </div>
        </div>
      </div>
    </AssessmentLayout>
  );
}
