import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Link,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { NarrativeOutput } from "@/lib/narrative";
import type { SectionTotals, ReadinessTier } from "@/types/assessment";
import type { ThreeYearProjection } from "@/lib/pdf-financials";
import { SECTION_PDF_LABELS, getStrengthsAndGaps } from "@/lib/pdf-questions";
import { formatCurrency } from "@/lib/pdf-financials";
import { TIER_LABELS, TIER_DEFINITIONS, TIER_SCORE_RANGES } from "@/lib/scoring";

// Use built-in Helvetica; react-pdf does not support WOFF2 (causes DataView error)
const FONT = "Helvetica";

const BRAND = {
  dark: "#333333",
  green: "#4cf37b",
  greenBright: "#23fe6f",
  white: "#ffffff",
  lightGray: "#F4F4F4",
  muted: "#666666",
  mutedLight: "#999999",
};

/** Light green tint for callout/highlight boxes (green at ~12% opacity). */
const GREEN_TINT = "#4cf37b1f";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 48,
    fontSize: 10,
    fontFamily: FONT,
    backgroundColor: BRAND.white,
    color: BRAND.dark,
  },
  coverPage: {
    padding: 48,
    justifyContent: "space-between",
    backgroundColor: BRAND.white,
    fontFamily: FONT,
  },
  coverCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  coverLogoWrap: {
    width: 300,
    height: 130,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  coverLogo: {
    width: 300,
    height: 115,
    objectFit: "contain",
  },
  coverTitle: {
    fontSize: 22,
    fontWeight: 700,
    fontFamily: FONT,
    color: BRAND.dark,
    marginBottom: 12,
    textAlign: "center",
  },
  coverSubtitle: {
    fontSize: 14,
    color: BRAND.dark,
    marginBottom: 8,
    textAlign: "center",
  },
  coverDate: {
    fontSize: 10,
    color: BRAND.muted,
    textAlign: "center",
  },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  logoSymbol: {
    width: 40,
    height: 40,
    objectFit: "contain",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 48,
    right: 48,
    fontSize: 8,
    color: BRAND.mutedLight,
    textAlign: "center",
    fontFamily: FONT,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    fontFamily: FONT,
    color: BRAND.dark,
    marginBottom: 12,
  },
  body: {
    fontSize: 10,
    fontFamily: FONT,
    color: BRAND.dark,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  small: {
    fontSize: 9,
    color: BRAND.muted,
    fontFamily: FONT,
  },
  h1: {
    fontSize: 18,
    fontWeight: 700,
    fontFamily: FONT,
    color: BRAND.green,
    marginBottom: 16,
  },
  h2: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: FONT,
    color: BRAND.green,
    marginBottom: 10,
  },
  h3: {
    fontSize: 11,
    fontWeight: 600,
    fontFamily: FONT,
    color: BRAND.dark,
    marginBottom: 6,
  },
  scoreBig: {
    fontSize: 48,
    fontWeight: 700,
    fontFamily: FONT,
    marginBottom: 8,
    color: BRAND.green,
  },
  scoreBigEmphasis: {
    fontSize: 48,
    fontWeight: 700,
    fontFamily: FONT,
    marginBottom: 8,
    color: BRAND.greenBright,
  },
  tierBadge: {
    fontSize: 12,
    fontWeight: 600,
    fontFamily: FONT,
    color: BRAND.white,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginBottom: 16,
    backgroundColor: BRAND.green,
  },
  calloutBox: {
    backgroundColor: GREEN_TINT,
    borderLeftWidth: 4,
    borderLeftColor: BRAND.green,
    padding: 10,
    marginBottom: 8,
  },
  barBg: {
    height: 8,
    backgroundColor: BRAND.lightGray,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 4,
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: BRAND.green,
  },
  table: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: BRAND.lightGray,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderColor: BRAND.green,
    paddingBottom: 8,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  col1: { width: "40%" },
  col2: { width: "20%" },
  col3: { width: "20%" },
  col4: { width: "20%" },
  twoCol: { flexDirection: "row", gap: 24, marginTop: 12 },
  halfCol: { flex: 1 },
  bullet: { marginBottom: 6, paddingLeft: 12 },
  ctaBox: {
    backgroundColor: GREEN_TINT,
    padding: 20,
    marginTop: 20,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: BRAND.green,
  },
  link: { color: BRAND.green, fontFamily: FONT },
  darkPage: {
    padding: 48,
    backgroundColor: BRAND.white,
    fontFamily: FONT,
    color: BRAND.dark,
  },
  darkTitle: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: FONT,
    color: BRAND.dark,
    marginBottom: 16,
  },
  darkBody: {
    fontSize: 10,
    color: BRAND.dark,
    lineHeight: 1.5,
    marginBottom: 8,
    fontFamily: FONT,
  },
  darkLink: { color: BRAND.green, fontFamily: FONT },
  ctaLink: {
    color: BRAND.green,
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 700,
    marginTop: 16,
    textDecoration: "none",
  },
  ctaButton: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: BRAND.green,
    borderRadius: 6,
    alignSelf: "center",
  },
  ctaButtonText: {
    color: BRAND.dark,
    fontFamily: FONT,
    fontSize: 14,
    fontWeight: 700,
    textDecoration: "none",
  },
  cornerIconWrap: {
    position: "absolute",
    top: 40,
    right: 48,
    width: 44,
    height: 44,
  },
  cornerIcon: {
    width: 44,
    height: 44,
    objectFit: "contain",
  },
  logoSymbolWrap: {
    width: 44,
    height: 44,
  },
  logoSymbolCropped: {
    width: 44,
    height: 44,
    objectFit: "contain",
  },
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
  assetsBasePath: string;
  /** Main logo for white backgrounds (cover + last page). */
  logoMainPath?: string;
  /** Symbol icon for top-right on every page. */
  logoSymbolPath?: string;
  sectionQuestionDetails: { sectionNum: number; questions: { questionName: string; score: number; shortLabel: string }[] }[];
}

const MAX_SECTION = 25;

const FOOTER_TEXT = "Untapped Channel Strategy | untappedchannelstrategy.com";

function ContentPage({
  children,
  logoPath,
}: {
  children: React.ReactNode;
  logoPath?: string;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.contentHeader}>
        {logoPath ? (
          <View style={styles.logoSymbolWrap}>
            <Image src={logoPath} style={styles.logoSymbolCropped} />
          </View>
        ) : null}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
      <Text style={styles.footer} fixed>
        {FOOTER_TEXT}
      </Text>
    </Page>
  );
}

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
    assetsBasePath,
    logoMainPath,
    logoSymbolPath,
    sectionQuestionDetails,
  } = data;

  const sectionNums: number[] = [1, 2, 3, 4, 5, 6];
  if (!section7Skipped) sectionNums.push(7);

  const costOfDelayStat =
    costOfDelay &&
    `Every quarter without an MSP channel costs approximately ${formatCurrency(costOfDelay.cacSavingsPerQuarter)} in higher acquisition costs and ${formatCurrency(costOfDelay.year1MspRevenueLost / 4)} in unrealized partner revenue.`;

  return (
    <Document title={`MSP Channel Readiness Assessment - ${companyName}`} author="Untapped Channel Strategy">
      {/* Page 1: Cover – white */}
      <Page size="A4" style={styles.coverPage}>
        {logoSymbolPath ? (
          <View style={styles.cornerIconWrap}>
            <Image src={logoSymbolPath} style={styles.cornerIcon} />
          </View>
        ) : null}
        <View style={styles.coverCenter}>
          {logoMainPath ? (
            <View style={styles.coverLogoWrap}>
              <Image src={logoMainPath} style={styles.coverLogo} />
            </View>
          ) : null}
          <Text style={styles.coverTitle}>MSP Channel Readiness Assessment</Text>
          <Text style={styles.coverSubtitle}>Prepared for {companyName}</Text>
        </View>
        <Text style={styles.coverDate}>{date}</Text>
      </Page>

      {/* Page 2: Executive Summary */}
      <ContentPage logoPath={logoSymbolPath}>
        <Text style={styles.h1}>Executive Summary</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Text style={styles.scoreBigEmphasis}>{overallScore}</Text>
          <View style={styles.tierBadge}>
            <Text>{TIER_LABELS[readinessTier]}</Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: GREEN_TINT,
            padding: 12,
            marginBottom: 16,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: BRAND.lightGray,
          }}
        >
          <Text style={[styles.body, { fontWeight: 600, marginBottom: 4 }]}>
            {TIER_LABELS[readinessTier]} ({TIER_SCORE_RANGES[readinessTier]})
          </Text>
          <Text style={styles.body}>{TIER_DEFINITIONS[readinessTier]}</Text>
        </View>
        <Text style={[styles.body, { marginBottom: 16 }]}>{narrative.executive_summary}</Text>
        {redFlags.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.h3, { marginBottom: 8 }]}>Critical items</Text>
            {redFlags.map((flag, i) => (
              <View key={i} style={styles.calloutBox}>
                <Text style={styles.body}>{flag}</Text>
              </View>
            ))}
          </View>
        )}
        {narrative.section_interpretations[0]?.recommendation && (
          <Text style={[styles.body, { fontWeight: 600 }]}>{narrative.section_interpretations[0].recommendation}</Text>
        )}
      </ContentPage>

      {/* Section breakdowns */}
      {sectionNums.map((num) => {
        const total =
          num === 1
            ? sectionTotals.section1
            : num === 2
              ? sectionTotals.section2
              : num === 3
                ? sectionTotals.section3
                : num === 4
                  ? sectionTotals.section4
                  : num === 5
                    ? sectionTotals.section5
                    : num === 6
                      ? sectionTotals.section6
                      : sectionTotals.section7 ?? 0;
        const interp = narrative.section_interpretations.find((s) => s.section_number === num);
        const { strengths, gaps } = getStrengthsAndGaps(num, sectionScores[num - 1]);
        const sectionDetails = sectionQuestionDetails.find((s) => s.sectionNum === num);
        const pct = MAX_SECTION > 0 ? (total / MAX_SECTION) * 100 : 0;
        return (
          <ContentPage key={num} logoPath={logoSymbolPath}>
            <Text style={styles.h2}>
              {SECTION_PDF_LABELS[num]}: {total}/25
            </Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${pct}%` }]} />
            </View>
            {sectionDetails && sectionDetails.questions.length > 0 && (
              <View style={{ marginTop: 12, marginBottom: 12, backgroundColor: BRAND.lightGray, padding: 10, borderRadius: 4 }}>
                <Text style={[styles.h3, { marginBottom: 8 }]}>Your answers</Text>
                {sectionDetails.questions.map((q, i) => (
                  <View key={i} style={{ marginBottom: i < sectionDetails.questions.length - 1 ? 8 : 0 }}>
                    <Text style={[styles.body, { fontWeight: 600 }]}>{q.questionName}</Text>
                    <Text style={[styles.small, { marginTop: 2 }]}>
                      Score: {q.score}/5 — {q.shortLabel}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            {interp && (
              <>
                <Text style={[styles.body, { marginTop: 12 }]}>{interp.interpretation}</Text>
                {strengths.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.h3}>Strengths</Text>
                    {strengths.map((s, i) => (
                      <Text key={i} style={[styles.body, styles.bullet]}>
                        • {s}
                      </Text>
                    ))}
                  </View>
                )}
                {gaps.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.h3}>Gaps</Text>
                    {gaps.map((g, i) => (
                      <Text key={i} style={[styles.body, styles.bullet]}>
                        • {g}
                      </Text>
                    ))}
                  </View>
                )}
                <Text style={[styles.body, { marginTop: 12, fontWeight: 600 }]}>{interp.recommendation}</Text>
              </>
            )}
          </ContentPage>
        );
      })}

      {/* Financial Impact */}
      <ContentPage logoPath={logoSymbolPath}>
        <Text style={styles.h1}>Financial Impact Analysis</Text>
        {projection && (
          <View style={{ marginBottom: 16 }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.col1, { fontWeight: 600 }]}>Metric</Text>
              <Text style={[styles.col2, { fontWeight: 600 }]}>Year 1</Text>
              <Text style={[styles.col3, { fontWeight: 600 }]}>Year 2</Text>
              <Text style={[styles.col4, { fontWeight: 600 }]}>Year 3</Text>
            </View>
            {[
              { label: "Active MSP Partners", y1: projection.year1.partners, y2: projection.year2.partners, y3: projection.year3.partners },
              {
                label: "Avg Clients per Partner",
                y1: projection.year1.clientsPerPartner,
                y2: projection.year2.clientsPerPartner,
                y3: projection.year3.clientsPerPartner,
              },
              {
                label: "Total MSP Clients",
                y1: projection.year1.totalClients,
                y2: projection.year2.totalClients,
                y3: projection.year3.totalClients,
              },
              {
                label: "MSP Revenue",
                y1: formatCurrency(projection.year1.mspRevenue),
                y2: formatCurrency(projection.year2.mspRevenue),
                y3: formatCurrency(projection.year3.mspRevenue),
              },
              {
                label: "MSP Revenue as % of ARR",
                y1: `${projection.year1.mspRevenuePctArr.toFixed(0)}%`,
                y2: `${projection.year2.mspRevenuePctArr.toFixed(0)}%`,
                y3: `${projection.year3.mspRevenuePctArr.toFixed(0)}%`,
              },
            ].map((row, i) => (
              <View key={i} style={i % 2 === 1 ? styles.tableRowAlt : styles.table}>
                <Text style={styles.col1}>{row.label}</Text>
                <Text style={styles.col2}>{row.y1}</Text>
                <Text style={styles.col3}>{row.y2}</Text>
                <Text style={styles.col4}>{row.y3}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.body}>{narrative.financial_commentary}</Text>
        <View style={{ marginTop: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: BRAND.lightGray }}>
          <Text style={[styles.small, { color: BRAND.muted }]}>
            These projections are estimates based on industry benchmarks and the data you provided. Actual results will
            vary based on execution, market conditions, and program investment. These figures are intended to illustrate
            the potential scale of opportunity, not guarantee specific outcomes.
          </Text>
        </View>
      </ContentPage>

      {/* Cost of Delay */}
      <ContentPage logoPath={logoSymbolPath}>
        <Text style={styles.h1}>Cost of Delay</Text>
        {costOfDelay && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.body}>
              Quarterly new customers (current trajectory): {costOfDelay.quarterlyNewCustomers}
            </Text>
            <Text style={styles.body}>
              CAC savings per quarter with MSP channel: {formatCurrency(costOfDelay.cacSavingsPerQuarter)}
            </Text>
            <Text style={styles.body}>
              Year 1 MSP revenue at risk if you wait 12 months: {formatCurrency(costOfDelay.year1MspRevenueLost)}
            </Text>
          </View>
        )}
        <Text style={styles.body}>{narrative.cost_of_delay_narrative}</Text>
        {costOfDelayStat && (
          <View style={[styles.ctaBox, { marginTop: 16 }]}>
            <Text style={[styles.body, { fontWeight: 600 }]}>{costOfDelayStat}</Text>
          </View>
        )}
      </ContentPage>

      {/* DIY vs Expert */}
      <ContentPage logoPath={logoSymbolPath}>
        <Text style={styles.h1}>DIY vs. Expert-Guided Build</Text>
        <View style={styles.twoCol}>
          <View style={styles.halfCol}>
            <Text style={styles.h2}>DIY Build (18-24 months)</Text>
            <Text style={styles.body}>• VP/Director Channel hire: $180K-$250K/yr fully loaded</Text>
            <Text style={styles.body}>• 1-2 channel managers: $100K-$150K each</Text>
            <Text style={styles.body}>• Time to productivity: 6-9 months</Text>
            <Text style={styles.body}>• First 18 months cost: $350K-$550K salary + $50K-$100K program costs</Text>
            <Text style={[styles.body, { fontWeight: 600 }]}>
              • Total: $500K-$900K over 18 months, revenue starting month 15-18
            </Text>
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.h2}>Expert-Guided Build (6-9 months)</Text>
            <Text style={styles.body}>• Engagement: $60K-$200K over 6-9 months</Text>
            <Text style={styles.body}>• Internal hire still needed but walks into launch-ready playbook</Text>
            <Text style={styles.body}>• Revenue starts month 9-12</Text>
            <Text style={styles.body}>• Mistakes avoided save $200K-$400K</Text>
            <Text style={[styles.body, { fontWeight: 600 }]}>
              • Total: $60K-$200K engagement + hire, revenue 6-9 months sooner
            </Text>
          </View>
        </View>
        <Text style={[styles.h3, { marginTop: 20 }]}>Common Mistakes Tax</Text>
        <Text style={styles.body}>
          1. Wrong pricing model (6 months to discover/fix): ~40% of Year 1 MSP revenue lost
        </Text>
        <Text style={styles.body}>
          2. Channel conflict (9 months to surface/resolve): 30-50% of early partners disengage permanently
        </Text>
        <Text style={styles.body}>
          3. Wrong partner recruitment (70% never activate): $2K-$5K wasted per inactive partner
        </Text>
        <Text style={styles.body}>
          4. No distributor strategy (12 months to course-correct): miss 60-70% of addressable partner base
        </Text>
        <Text style={styles.body}>
          5. End-user enablement instead of MSP enablement (6-9 months of rework)
        </Text>
        <View style={[styles.ctaBox, { marginTop: 16 }]}>
          <Text style={styles.body}>
            The engagement does not replace your internal hire. It gives them a launch-ready playbook instead of a
            12-month learning curve.
          </Text>
        </View>
      </ContentPage>

      {/* Last page: CTA */}
      <Page size="A4" style={styles.darkPage}>
        {logoSymbolPath ? (
          <View style={styles.cornerIconWrap}>
            <Image src={logoSymbolPath} style={styles.cornerIcon} />
          </View>
        ) : null}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          {logoMainPath ? (
            <View style={[styles.coverLogoWrap, { marginBottom: 24 }]}>
              <Image src={logoMainPath} style={styles.coverLogo} />
            </View>
          ) : null}
          <Text style={styles.darkTitle}>What Comes Next</Text>
        </View>
        <Text style={[styles.darkBody, { marginBottom: 16 }]}>
          I offer a complimentary 90-minute deep-dive assessment where we walk through each dimension in detail and build
          a customized action plan. No cost, no obligation. You will walk away with actionable insight whether or not we
          work together.
        </Text>
        <Text style={styles.darkBody}>Jon Purcell</Text>
        <Text style={styles.darkBody}>Untapped Channel Strategy</Text>
        <Text style={styles.darkBody}>untappedchannelstrategy.com</Text>
        <Link src={bookingUrl} style={[styles.ctaButton, styles.ctaButtonText]}>
          Book Your Complimentary Deep-Dive Assessment
        </Link>
        <Text style={[styles.footer, { color: BRAND.mutedLight, position: "absolute", bottom: 20 }]} fixed>
          {FOOTER_TEXT}
        </Text>
      </Page>
    </Document>
  );
}
