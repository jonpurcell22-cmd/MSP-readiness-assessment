import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
import type { NarrativeOutput } from "@/lib/narrative";
import type { SectionTotals, ReadinessTier } from "@/types/assessment";
import type { ThreeYearProjection } from "@/lib/pdf-financials";
import { SECTION_PDF_LABELS, getStrengthsAndGaps } from "@/lib/pdf-questions";
import { formatCurrency } from "@/lib/pdf-financials";
import { TIER_LABELS } from "@/lib/scoring";

const TIER_COLORS: Record<ReadinessTier, string> = {
  ready: "#2D8C46",
  capable: "#1A8A7D",
  emerging: "#D97706",
  premature: "#DC2626",
};

const COLORS = {
  primary: "#1B3A5C",
  accent: "#1A8A7D",
  muted: "#6B7280",
  lightBg: "#F4F7FA",
  border: "#E5E7EB",
};

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10 },
  coverPage: { padding: 48, fontSize: 10, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: 700, color: COLORS.primary, marginBottom: 12 },
  subtitle: { fontSize: 16, color: COLORS.muted, marginBottom: 32 },
  body: { fontSize: 10, color: COLORS.primary, lineHeight: 1.5, marginBottom: 8 },
  small: { fontSize: 9, color: COLORS.muted },
  h1: { fontSize: 18, fontWeight: 700, color: COLORS.primary, marginBottom: 16 },
  h2: { fontSize: 14, fontWeight: 600, color: COLORS.primary, marginBottom: 10 },
  h3: { fontSize: 11, fontWeight: 600, color: COLORS.primary, marginBottom: 6 },
  scoreBig: { fontSize: 48, fontWeight: 700, marginBottom: 8 },
  tierBadge: { fontSize: 12, fontWeight: 600, color: "white", paddingVertical: 4, paddingHorizontal: 12, alignSelf: "flex-start", marginBottom: 16 },
  redFlag: { backgroundColor: "#FEF2F2", borderLeftWidth: 4, borderLeftColor: "#DC2626", padding: 10, marginBottom: 8 },
  barBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: "hidden", marginTop: 4 },
  barFill: { height: "100%", borderRadius: 4 },
  table: { flexDirection: "row", borderBottomWidth: 1, borderColor: COLORS.border, paddingVertical: 8 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, borderColor: COLORS.primary, paddingBottom: 8, marginBottom: 4 },
  col1: { width: "40%" },
  col2: { width: "20%" },
  col3: { width: "20%" },
  col4: { width: "20%" },
  twoCol: { flexDirection: "row", gap: 24, marginTop: 12 },
  halfCol: { flex: 1 },
  bullet: { marginBottom: 6, paddingLeft: 12 },
  ctaBox: { backgroundColor: COLORS.lightBg, padding: 20, marginTop: 20 },
  link: { color: COLORS.accent },
});

export interface PDFData {
  companyName: string;
  date: string;
  overallScore: number;
  readinessTier: ReadinessTier;
  sectionTotals: SectionTotals;
  section7Skipped: boolean;
  sectionScores: [
    { q1: number; q2: number; q3: number; q4: number; q5: number } | null,
    { q1: number; q2: number; q3: number; q4: number; q5: number } | null,
    { q1: number; q2: number; q3: number; q4: number; q5: number } | null,
    { q1: number; q2: number; q3: number; q4: number; q5: number } | null,
    { q1: number; q2: number; q3: number; q4: number; q5: number } | null,
    { q1: number; q2: number; q3: number; q4: number; q5: number } | null,
    { q1: number; q2: number; q3: number; q4: number; q5: number } | null,
  ];
  redFlags: string[];
  narrative: NarrativeOutput;
  projection: ThreeYearProjection | null;
  costOfDelay: { quarterlyNewCustomers: number; cacSavingsPerQuarter: number; year1MspRevenueLost: number } | null;
  arr: number;
  acv: number;
  bookingUrl: string;
}

const MAX_SECTION = 25;

export function AssessmentPDFDocument({ data }: { data: PDFData }) {
  const {
    companyName,
    date,
    overallScore,
    readinessTier,
    sectionTotals,
    section7Skipped,
    sectionScores,
    redFlags,
    narrative,
    projection,
    costOfDelay,
    arr,
    acv,
    bookingUrl,
  } = data;

  const tierColor = TIER_COLORS[readinessTier];
  const sectionNums: number[] = [1, 2, 3, 4, 5, 6];
  if (!section7Skipped) sectionNums.push(7);

  const timelineText =
    readinessTier === "ready"
      ? "3 to 4 months"
      : readinessTier === "capable"
        ? "4 to 6 months"
        : readinessTier === "emerging"
          ? "6 to 9 months"
          : "12+ months";

  const costOfDelayStat =
    costOfDelay &&
    `Every quarter without an MSP channel costs approximately ${formatCurrency(costOfDelay.cacSavingsPerQuarter)} in higher acquisition costs and ${formatCurrency(costOfDelay.year1MspRevenueLost / 4)} in unrealized partner revenue.`;

  return (
    <Document title={`MSP Channel Readiness Assessment - ${companyName}`} author="Jon Purcell">
      {/* Page 1: Cover */}
      <Page size="A4" style={styles.coverPage}>
        <View>
          <Text style={styles.title}>MSP Channel Readiness Assessment</Text>
          <Text style={styles.subtitle}>Prepared for {companyName}</Text>
          <Text style={styles.body}>{date}</Text>
          <Text style={[styles.body, { marginTop: 48 }]}>Prepared by: Jon Purcell | Untapped Channel Strategy</Text>
          <Text style={styles.body}>untappedchannelstrategy.com</Text>
        </View>
      </Page>

      {/* Page 2: Executive Summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Executive Summary</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Text style={[styles.scoreBig, { color: tierColor }]}>{overallScore}</Text>
          <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
            <Text>{TIER_LABELS[readinessTier]}</Text>
          </View>
        </View>
        <Text style={[styles.body, { marginBottom: 16 }]}>{narrative.executive_summary}</Text>
        {redFlags.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.h3, { marginBottom: 8 }]}>Critical items</Text>
            {redFlags.map((flag, i) => (
              <View key={i} style={styles.redFlag}>
                <Text style={styles.body}>{flag}</Text>
              </View>
            ))}
          </View>
        )}
        {narrative.section_interpretations[0]?.recommendation && (
          <Text style={[styles.body, { fontWeight: 600 }]}>{narrative.section_interpretations[0].recommendation}</Text>
        )}
      </Page>

      {/* Pages 3-4: Section breakdowns */}
      {sectionNums.map((num) => {
        const total = num === 1 ? sectionTotals.section1 : num === 2 ? sectionTotals.section2 : num === 3 ? sectionTotals.section3 : num === 4 ? sectionTotals.section4 : num === 5 ? sectionTotals.section5 : num === 6 ? sectionTotals.section6 : sectionTotals.section7 ?? 0;
        const interp = narrative.section_interpretations.find((s) => s.section_number === num);
        const { strengths, gaps } = getStrengthsAndGaps(num, sectionScores[num - 1]);
        const pct = MAX_SECTION > 0 ? (total / MAX_SECTION) * 100 : 0;
        return (
          <Page key={num} size="A4" style={styles.page}>
            <Text style={styles.h2}>{SECTION_PDF_LABELS[num]}: {total}/25</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: tierColor }]} />
            </View>
            {interp && (
              <>
                <Text style={[styles.body, { marginTop: 12 }]}>{interp.interpretation}</Text>
                {strengths.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.h3}>Strengths</Text>
                    {strengths.map((s, i) => (
                      <Text key={i} style={[styles.body, styles.bullet]}>• {s}</Text>
                    ))}
                  </View>
                )}
                {gaps.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.h3}>Gaps</Text>
                    {gaps.map((g, i) => (
                      <Text key={i} style={[styles.body, styles.bullet]}>• {g}</Text>
                    ))}
                  </View>
                )}
                <Text style={[styles.body, { marginTop: 12, fontWeight: 600 }]}>{interp.recommendation}</Text>
              </>
            )}
          </Page>
        );
      })}

      {/* Page 5: Financial Impact */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Financial Impact Analysis</Text>
        {projection && (
          <View style={{ marginBottom: 16 }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.col1, { fontWeight: 600 }]}>Metric</Text>
              <Text style={[styles.col2, { fontWeight: 600 }]}>Year 1</Text>
              <Text style={[styles.col3, { fontWeight: 600 }]}>Year 2</Text>
              <Text style={[styles.col4, { fontWeight: 600 }]}>Year 3</Text>
            </View>
            <View style={styles.table}>
              <Text style={styles.col1}>Active MSP Partners</Text>
              <Text style={styles.col2}>{projection.year1.partners}</Text>
              <Text style={styles.col3}>{projection.year2.partners}</Text>
              <Text style={styles.col4}>{projection.year3.partners}</Text>
            </View>
            <View style={styles.table}>
              <Text style={styles.col1}>Avg Clients per Partner</Text>
              <Text style={styles.col2}>{projection.year1.clientsPerPartner}</Text>
              <Text style={styles.col3}>{projection.year2.clientsPerPartner}</Text>
              <Text style={styles.col4}>{projection.year3.clientsPerPartner}</Text>
            </View>
            <View style={styles.table}>
              <Text style={styles.col1}>Total MSP Clients</Text>
              <Text style={styles.col2}>{projection.year1.totalClients}</Text>
              <Text style={styles.col3}>{projection.year2.totalClients}</Text>
              <Text style={styles.col4}>{projection.year3.totalClients}</Text>
            </View>
            <View style={styles.table}>
              <Text style={styles.col1}>MSP Revenue</Text>
              <Text style={styles.col2}>{formatCurrency(projection.year1.mspRevenue)}</Text>
              <Text style={styles.col3}>{formatCurrency(projection.year2.mspRevenue)}</Text>
              <Text style={styles.col4}>{formatCurrency(projection.year3.mspRevenue)}</Text>
            </View>
            <View style={styles.table}>
              <Text style={styles.col1}>MSP Revenue as % of ARR</Text>
              <Text style={styles.col2}>{projection.year1.mspRevenuePctArr.toFixed(0)}%</Text>
              <Text style={styles.col3}>{projection.year2.mspRevenuePctArr.toFixed(0)}%</Text>
              <Text style={styles.col4}>{projection.year3.mspRevenuePctArr.toFixed(0)}%</Text>
            </View>
          </View>
        )}
        <Text style={styles.body}>{narrative.financial_commentary}</Text>
      </Page>

      {/* Page 6: Cost of Delay */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Cost of Delay</Text>
        {costOfDelay && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.body}>Quarterly new customers (current trajectory): {costOfDelay.quarterlyNewCustomers}</Text>
            <Text style={styles.body}>CAC savings per quarter with MSP channel: {formatCurrency(costOfDelay.cacSavingsPerQuarter)}</Text>
            <Text style={styles.body}>Year 1 MSP revenue at risk if you wait 12 months: {formatCurrency(costOfDelay.year1MspRevenueLost)}</Text>
          </View>
        )}
        <Text style={styles.body}>{narrative.cost_of_delay_narrative}</Text>
        {costOfDelayStat && (
          <View style={[styles.ctaBox, { marginTop: 16 }]}>
            <Text style={[styles.body, { fontWeight: 600 }]}>{costOfDelayStat}</Text>
          </View>
        )}
      </Page>

      {/* Page 7: DIY vs Expert */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>DIY vs. Expert-Guided Build</Text>
        <View style={styles.twoCol}>
          <View style={styles.halfCol}>
            <Text style={styles.h2}>DIY Build (18-24 months)</Text>
            <Text style={styles.body}>• VP/Director Channel hire: $180K-$250K/yr fully loaded</Text>
            <Text style={styles.body}>• 1-2 channel managers: $100K-$150K each</Text>
            <Text style={styles.body}>• Time to productivity: 6-9 months</Text>
            <Text style={styles.body}>• First 18 months cost: $350K-$550K salary + $50K-$100K program costs</Text>
            <Text style={[styles.body, { fontWeight: 600 }]}>• Total: $500K-$900K over 18 months, revenue starting month 15-18</Text>
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.h2}>Expert-Guided Build (6-9 months)</Text>
            <Text style={styles.body}>• Engagement: $60K-$200K over 6-9 months</Text>
            <Text style={styles.body}>• Internal hire still needed but walks into launch-ready playbook</Text>
            <Text style={styles.body}>• Revenue starts month 9-12</Text>
            <Text style={styles.body}>• Mistakes avoided save $200K-$400K</Text>
            <Text style={[styles.body, { fontWeight: 600 }]}>• Total: $60K-$200K engagement + hire, revenue 6-9 months sooner</Text>
          </View>
        </View>
        <Text style={[styles.h3, { marginTop: 20 }]}>Common Mistakes Tax</Text>
        <Text style={styles.body}>1. Wrong pricing model (6 months to discover/fix): ~40% of Year 1 MSP revenue lost</Text>
        <Text style={styles.body}>2. Channel conflict (9 months to surface/resolve): 30-50% of early partners disengage permanently</Text>
        <Text style={styles.body}>3. Wrong partner recruitment (70% never activate): $2K-$5K wasted per inactive partner</Text>
        <Text style={styles.body}>4. No distributor strategy (12 months to course-correct): miss 60-70% of addressable partner base</Text>
        <Text style={styles.body}>5. End-user enablement instead of MSP enablement (6-9 months of rework)</Text>
        <View style={[styles.ctaBox, { marginTop: 16 }]}>
          <Text style={styles.body}>The engagement does not replace your internal hire. It gives them a launch-ready playbook instead of a 12-month learning curve.</Text>
        </View>
      </Page>

      {/* Page 8: Timeline */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Timeline to Launch</Text>
        <View style={[styles.tierBadge, { backgroundColor: tierColor, marginBottom: 16 }]}>
          <Text style={{ color: "white", fontWeight: 600 }}>{TIER_LABELS[readinessTier]}: {timelineText}</Text>
        </View>
        <Text style={styles.body}>{narrative.roadmap_narrative}</Text>
      </Page>

      {/* Page 9: CTA */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>What Comes Next</Text>
        <Text style={[styles.body, { marginBottom: 16 }]}>
          I offer a complimentary 90-minute deep-dive assessment where we walk through each dimension in detail and build a customized action plan. No cost, no obligation. You will walk away with actionable insight whether or not we work together.
        </Text>
        <Text style={styles.body}>Jon Purcell</Text>
        <Text style={styles.body}>Untapped Channel Strategy</Text>
        <Text style={styles.body}>untappedchannelstrategy.com</Text>
        {bookingUrl && (
          <Link src={bookingUrl} style={[styles.body, styles.link, { marginTop: 8 }]}>
            Book a call
          </Link>
        )}
        <Text style={[styles.body, { marginTop: 32, fontStyle: "italic" }]}>
          Built Apple&apos;s MSP program from zero. Rebuilding Workiva&apos;s. 9 years in VMware&apos;s channel organization. I know what works, what does not, and how to get you there faster.
        </Text>
      </Page>
    </Document>
  );
}
