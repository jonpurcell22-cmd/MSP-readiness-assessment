"use client"

import { AssessmentLayout } from "@/components/assessment-layout"
import { TierBadge } from "@/components/tier-badge"
import { ScoreGauge } from "@/components/score-gauge"
import { ResultsRadarChart } from "@/components/results-radar-chart"
import { SectionResultCard } from "@/components/section-result-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { sections } from "@/lib/assessment-data"
import type { Tier } from "@/lib/scoring"
import type { SectionTotals, Answers } from "@/types/assessment"
import { toPercentageScore } from "@/lib/scoring"
import type { ProjectionsResult, FinancialInputs } from "@/lib/financial-projections"
import { formatCurrency } from "@/lib/financial-projections"
import type { DiyExpertEstimate } from "@/lib/pdf-financials"
import { Calendar, Mail, Phone, FileDown, Compass } from "lucide-react"

interface CompetitorInsight {
  company: string
  strength: string
  channelApproach: string
  opportunity: string
}

interface ResultsContentProps {
  assessment: {
    id: string
    company_name: string
    contact_name: string
    email: string
    answers: Answers & { financial?: FinancialInputs }
    section_scores: SectionTotals
    total_score: number
    tier: Tier
  }
  tier: Tier
  tierDescription: string
  executiveSummary: string
  sectionInterpretations: Record<string, string>
  competitiveLandscape: { summary: string; competitors: CompetitorInsight[] }
  projections: ResultsProjections
}

/** Extended projections shape: base ProjectionsResult plus optional cost-of-delay and DIY/Expert. */
export type ResultsProjections = ProjectionsResult & {
  costOfDelay?: number
  diyEstimate?: DiyExpertEstimate
  expertEstimate?: DiyExpertEstimate
}

/** Derive display shape from ProjectionsResult for the financial table and cards. */
function toProjectionsDisplay(p: ResultsProjections): {
  yearlyProjections: Array<{
    year: number
    newPartners: number
    avgDealsPerPartner: number
    channelDeals: number
    channelRevenue: number
    netSavings: number
    cumulativeRevenue: number
  }>
  costOfDelay: number
  diyEstimate: { cost: number; timeMonths: number; risk: string }
  expertEstimate: { cost: number; timeMonths: number; risk: string }
} {
  const y1 = p.year1
  const y2 = p.year2
  const y3 = p.year3
  const cum1 = y1.revenue
  const cum2 = cum1 + y2.revenue
  const cum3 = cum2 + y3.revenue
  return {
    yearlyProjections: [
      {
        year: 1,
        newPartners: y1.partners,
        avgDealsPerPartner: y1.totalClients / y1.partners || 0,
        channelDeals: y1.totalClients,
        channelRevenue: y1.revenue,
        netSavings: 0,
        cumulativeRevenue: cum1,
      },
      {
        year: 2,
        newPartners: y2.partners,
        avgDealsPerPartner: y2.totalClients / y2.partners || 0,
        channelDeals: y2.totalClients,
        channelRevenue: y2.revenue,
        netSavings: 0,
        cumulativeRevenue: cum2,
      },
      {
        year: 3,
        newPartners: y3.partners,
        avgDealsPerPartner: y3.totalClients / y3.partners || 0,
        channelDeals: y3.totalClients,
        channelRevenue: y3.revenue,
        netSavings: 0,
        cumulativeRevenue: cum3,
      },
    ],
    costOfDelay: p.costOfDelay ?? 0,
    diyEstimate: p.diyEstimate ?? { cost: 0, timeMonths: 0, risk: "—" },
    expertEstimate: p.expertEstimate ?? { cost: 0, timeMonths: 0, risk: "—" },
  }
}

export function ResultsContent({
  assessment,
  tier,
  tierDescription,
  executiveSummary,
  sectionInterpretations,
  competitiveLandscape,
  projections: projectionsRaw,
}: ResultsContentProps) {
  const projections = toProjectionsDisplay(projectionsRaw)
  return (
    <AssessmentLayout>
      <div className="flex flex-col gap-14">
        {/* Hero Section */}
        <div className="animate-fade-in-up flex flex-col items-center gap-6 pt-4 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-editorial text-muted-foreground">
              Assessment Results
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[var(--brand-dark)] sm:text-3xl">
              Your MSP Channel Readiness Score
            </h1>
            <p className="mt-1 text-muted-foreground">
              {assessment.company_name} | {assessment.contact_name}
            </p>
          </div>

          <ScoreGauge score={toPercentageScore(assessment.total_score)} max={100} tier={tier} />
          <TierBadge tier={tier} className="text-base px-5 py-2" />

          <Button
            variant="outline"
            className="border-[var(--brand-green)] text-[var(--brand-dark)] hover:bg-[var(--brand-green)]/10 font-semibold transition-all hover:scale-[1.02]"
            onClick={() => window.print()}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF
          </Button>

          <Card className="w-full max-w-[560px] border-l-4 border-l-[var(--brand-green)] bg-card shadow-sm">
            <CardContent className="py-4 px-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tierDescription}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Radar Chart */}
        <div className="animate-fade-in-up animate-delay-100">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[var(--brand-dark)]">
                Channel Readiness Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResultsRadarChart sectionScores={assessment.section_scores} />
            </CardContent>
          </Card>
        </div>

        {/* Executive Summary */}
        <div className="animate-fade-in-up animate-delay-200">
          <Card className="border-l-4 border-l-[var(--brand-green)] bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[var(--brand-dark)]">
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {executiveSummary.split("\n\n").map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section-by-Section Results */}
        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-[var(--brand-dark)] sm:text-2xl">
            Section Analysis
          </h2>
          {sections.map((section, i) => (
            <div
              key={section.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <SectionResultCard
                section={section}
                score={assessment.section_scores?.[section.id] || 0}
                interpretation={sectionInterpretations[section.id]}
                answers={
                  (assessment.answers?.[section.id] as Record<string, number>) ||
                  {}
                }
              />
            </div>
          ))}
        </div>

        {/* Competitive Landscape */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-[var(--brand-dark)] sm:text-xl">
              <Compass className="h-5 w-5 text-[var(--brand-green)]" />
              Competitive Landscape
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {competitiveLandscape.summary}
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--brand-subtle)]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-editorial text-[var(--brand-dark)]">
                      Competitor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-editorial text-[var(--brand-dark)]">
                      Strength
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-editorial text-[var(--brand-dark)]">
                      Channel Approach
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-editorial text-[var(--brand-dark)]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {competitiveLandscape.competitors.map((comp, i) => (
                    <tr
                      key={i}
                      className="border-t border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {comp.company}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {comp.strength}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {comp.channelApproach}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-[var(--brand-green)]/15 px-2.5 py-0.5 text-xs font-semibold text-[var(--brand-dark)]">
                          {comp.opportunity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Financial Projections */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-[var(--brand-dark)]">
              3-Year Channel Revenue Projections
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-8">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--brand-subtle)]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-editorial text-[var(--brand-dark)]">
                      Metric
                    </th>
                    {projections.yearlyProjections.map((yp) => (
                      <th
                        key={yp.year}
                        className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-editorial text-[var(--brand-dark)]"
                      >
                        Year {yp.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">New Partners</td>
                    {projections.yearlyProjections.map((yp) => (
                      <td key={yp.year} className="px-4 py-3 text-right text-foreground">
                        {yp.newPartners}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">Avg Deals / Partner</td>
                    {projections.yearlyProjections.map((yp) => (
                      <td key={yp.year} className="px-4 py-3 text-right text-foreground">
                        {yp.avgDealsPerPartner}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">Channel Deals</td>
                    {projections.yearlyProjections.map((yp) => (
                      <td key={yp.year} className="px-4 py-3 text-right text-foreground">
                        {yp.channelDeals}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">Channel Revenue</td>
                    {projections.yearlyProjections.map((yp) => (
                      <td key={yp.year} className="px-4 py-3 text-right font-semibold text-foreground">
                        {formatCurrency(yp.channelRevenue)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">CAC Savings</td>
                    {projections.yearlyProjections.map((yp) => (
                      <td key={yp.year} className="px-4 py-3 text-right text-[var(--brand-dark)]">
                        {formatCurrency(yp.netSavings)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t-2 border-[var(--brand-green)] bg-[var(--brand-green)]/5">
                    <td className="px-4 py-3 font-semibold text-[var(--brand-dark)]">
                      Cumulative Revenue
                    </td>
                    {projections.yearlyProjections.map((yp) => (
                      <td key={yp.year} className="px-4 py-3 text-right font-bold text-[var(--brand-dark)]">
                        {formatCurrency(yp.cumulativeRevenue)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cost of Delay */}
            <Card className="border-amber-200 bg-amber-50 shadow-none">
              <CardContent className="py-5 px-5">
                <p className="text-sm font-semibold text-amber-800">
                  Cost of Delay
                </p>
                <p className="mt-1 text-3xl font-bold text-amber-900">
                  {formatCurrency(projections.costOfDelay)}
                  <span className="ml-2 text-sm font-normal text-amber-700">
                    per quarter in missed channel revenue
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* DIY vs Expert */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Card className="border-border shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-muted-foreground">
                    DIY Approach
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-3xl font-bold text-foreground">
                    {formatCurrency(projections.diyEstimate.cost)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {projections.diyEstimate.timeMonths} months to launch
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {projections.diyEstimate.risk}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-[var(--brand-green)] bg-[var(--brand-green)]/5 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-[var(--brand-dark)]">
                    Expert-Guided Approach
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-3xl font-bold text-[var(--brand-dark)]">
                    {formatCurrency(projections.expertEstimate.cost)}
                  </p>
                  <p className="text-sm text-[var(--brand-dark)]">
                    {projections.expertEstimate.timeMonths} months to launch
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {projections.expertEstimate.risk}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section - Full-width dark band */}
        <div className="-mx-6 -mb-8 bg-[var(--brand-dark)] px-6 py-14 text-center sm:py-16">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to Accelerate Your Channel Strategy?
          </h2>
          <p className="mx-auto mt-4 max-w-[500px] text-sm leading-relaxed text-white/70">
            Our MSP channel experts have helped dozens of technology vendors
            build profitable partner programs. Schedule a free strategy call to
            discuss your results.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              className="h-14 bg-[var(--brand-green)] px-10 text-base font-bold text-[var(--brand-dark)] shadow-lg transition-all duration-200 hover:bg-[var(--brand-green)]/90 hover:shadow-xl hover:scale-[1.02]"
              asChild
            >
              <a
                href="https://calendly.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Schedule a Strategy Call
              </a>
            </Button>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
            <a
              href="mailto:info@untappedchannelstrategy.com"
              className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4" />
              info@untappedchannelstrategy.com
            </a>
            <a
              href="tel:+15551234567"
              className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <Phone className="h-4 w-4" />
              (555) 123-4567
            </a>
          </div>
        </div>
      </div>
    </AssessmentLayout>
  )
}
