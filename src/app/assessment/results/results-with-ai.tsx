"use client";

import { useEffect, useState, useRef } from "react";
import { ResultsContent } from "./results-content";
import type { Tier } from "@/lib/scoring";
import type { ProjectionsResult } from "@/lib/financial-projections";
import type { SubmitPayload } from "@/app/api/submit/route";
import type { NarrativePart1, NarrativePart2 } from "@/lib/narrative";
import type { CompetitiveLandscapeOutput } from "@/types/competitive";

export interface ResultsWithAIProps {
  assessment: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    answers: Record<string, unknown>;
    section_scores: Record<string, number>;
    total_score: number;
    tier: Tier;
  };
  tierDescription: string;
  projections: ProjectionsResult;
  narrativePayload: SubmitPayload | null;
  competitivePayload: {
    companyName: string;
    productCategory: string;
    section6Total: number;
    section6Scores?: { q1: number; q2: number; q3: number; q4: number; q5: number };
  } | null;
  initialExecutiveSummary: string;
  initialSectionInterpretations: Record<string, string>;
  initialCompetitiveLandscape: string;
}

export function ResultsWithAI({
  assessment,
  tierDescription,
  projections,
  narrativePayload,
  competitivePayload,
  initialExecutiveSummary,
  initialSectionInterpretations,
  initialCompetitiveLandscape,
}: ResultsWithAIProps) {
  const [executiveSummary, setExecutiveSummary] = useState(initialExecutiveSummary);
  const [sectionInterpretations, setSectionInterpretations] = useState(initialSectionInterpretations);
  const [competitiveLandscape, setCompetitiveLandscape] = useState(initialCompetitiveLandscape);
  const [aiLoading, setAiLoading] = useState(!!narrativePayload);
  const fetchStarted = useRef(false);

  useEffect(() => {
    if (!narrativePayload || fetchStarted.current) return;
    fetchStarted.current = true;

    const run = async () => {
      try {
        const [res1, res2, res3, compRes] = await Promise.all([
          fetch("/api/generate-narrative", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...narrativePayload, part: 1 }),
          }),
          fetch("/api/generate-narrative", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...narrativePayload, part: 2 }),
          }),
          fetch("/api/generate-narrative", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...narrativePayload, part: 3 }),
          }),
          competitivePayload
            ? fetch("/api/generate-competitive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(competitivePayload),
              })
            : Promise.resolve(null),
        ]);

        const part1: NarrativePart1 | null = res1.ok ? ((await res1.json()) as NarrativePart1) : null;
        const part2: NarrativePart2 | null = res2.ok ? ((await res2.json()) as NarrativePart2) : null;
        const comp: CompetitiveLandscapeOutput | null =
          compRes?.ok ? ((await compRes?.json()) as CompetitiveLandscapeOutput) : null;

        if (part1?.executive_summary) setExecutiveSummary(part1.executive_summary);
        if (part2?.section_interpretations?.length) {
          const next: Record<string, string> = {};
          for (const s of part2.section_interpretations) {
            const key = `section${s.section_number}`;
            next[key] = s.recommendation ? `${s.interpretation}\n\n${s.recommendation}` : s.interpretation;
          }
          setSectionInterpretations((prev) => ({ ...prev, ...next }));
        }
        if (comp?.landscapeSummary) {
          const parts = [comp.landscapeSummary];
          if (comp.strategicImplication) parts.push(comp.strategicImplication);
          if (comp.distributorOpportunity) parts.push(comp.distributorOpportunity);
          setCompetitiveLandscape(parts.join("\n\n"));
        }
      } catch (e) {
        console.error("AI narrative fetch error:", e);
        setExecutiveSummary(initialExecutiveSummary);
        setSectionInterpretations(initialSectionInterpretations);
        setCompetitiveLandscape(initialCompetitiveLandscape);
      } finally {
        setAiLoading(false);
      }
    };

    run();
  }, [narrativePayload, competitivePayload, initialExecutiveSummary, initialSectionInterpretations, initialCompetitiveLandscape]);

  if (aiLoading) {
    return (
      <ResultsContent
        assessment={assessment}
        tier={assessment.tier}
        tierDescription={tierDescription}
        executiveSummary=""
        sectionInterpretations={{}}
        competitiveLandscape=""
        projections={projections}
        aiLoading={{
          executiveSummary: true,
          sectionAnalysis: true,
          competitive: true,
        }}
      />
    );
  }

  return (
    <ResultsContent
      assessment={assessment}
      tier={assessment.tier}
      tierDescription={tierDescription}
      executiveSummary={executiveSummary}
      sectionInterpretations={sectionInterpretations}
      competitiveLandscape={competitiveLandscape}
      projections={projections}
    />
  );
}
