"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AssessmentLayout } from "@/components/assessment-layout";
import { SectionStepper } from "@/components/section-stepper";
import { AnswerCard } from "@/components/answer-card";
import { Button } from "@/components/ui/button";
import { sections } from "@/lib/assessment-data";
import { useAssessmentStore } from "@/lib/store";
import type { SectionScores } from "@/types/assessment";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AssessmentSectionPage() {
  const params = useParams();
  const router = useRouter();

  const sectionNum = Number(params.section);
  const section = sectionNum >= 1 && sectionNum <= 7 ? sections[sectionNum - 1] : null;

  const sectionScores = useAssessmentStore((s) =>
    section ? (s[section.id] as SectionScores | null) : null
  );
  const setSectionScores = useAssessmentStore((s) => s.setSectionScores);

  const currentAnswers: Record<string, number> = sectionScores
    ? {
        q1: sectionScores.q1,
        q2: sectionScores.q2,
        q3: sectionScores.q3,
        q4: sectionScores.q4,
        q5: sectionScores.q5,
      }
    : {};
  const allQuestionsAnswered =
    section?.questions.every((q) => currentAnswers[q.id] !== undefined && currentAnswers[q.id] > 0) ?? false;

  const handleAnswer = useCallback(
    (questionId: string, score: number) => {
      if (!section) return;
      setSectionScores(section.id, { [questionId]: score });
    },
    [section, setSectionScores]
  );

  function saveAndNavigate(direction: "prev" | "next") {
    if (!section) return;

    if (direction === "next") {
      if (sectionNum < 6) {
        router.push(`/assessment/${sectionNum + 1}`);
      } else if (sectionNum === 6) {
        router.push("/assessment/channel-health");
      } else {
        router.push("/assessment/financials");
      }
    } else {
      if (sectionNum > 1 && sectionNum !== 7) {
        router.push(`/assessment/${sectionNum - 1}`);
      } else if (sectionNum === 7) {
        router.push("/assessment/channel-health");
      } else {
        router.push("/");
      }
    }
  }

  if (!section) {
    return (
      <AssessmentLayout>
        <p className="py-20 text-center text-muted-foreground">
          Invalid section. Please start the assessment from the beginning.
        </p>
      </AssessmentLayout>
    );
  }

  return (
    <AssessmentLayout>
      <div className="animate-slide-in">
        <div className="mb-8 flex justify-center">
          <SectionStepper currentSection={sectionNum} />
        </div>

        <div className="mb-8 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-editorial text-[var(--brand-green)]">
            Section {sectionNum} of 7
          </p>
          <h1 className="text-2xl font-bold text-[var(--brand-dark)] sm:text-[1.7rem]">
            {section.title}
          </h1>
          <p className="text-muted-foreground leading-relaxed">{section.description}</p>
        </div>

        <div className="mb-8 flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Progress:</span>
          <div className="flex items-center gap-1.5">
            {section.questions.map((q, i) => {
              const isAnswered =
                currentAnswers[q.id] !== undefined && currentAnswers[q.id] > 0;
              return (
                <div
                  key={q.id}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300",
                    isAnswered
                      ? "bg-[var(--brand-green)] text-[var(--brand-dark)]"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isAnswered ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-xs text-muted-foreground">
            {section.questions.filter((q) => currentAnswers[q.id] > 0).length}/
            {section.questions.length}
          </span>
        </div>

        <div className="flex flex-col gap-10">
          {section.questions.map((question, qIndex) => (
            <div
              key={question.id}
              className="animate-fade-in-up flex flex-col gap-4"
              style={{ animationDelay: `${qIndex * 80}ms` }}
            >
              <div className="flex flex-col gap-1.5">
                <p className="text-base font-semibold text-[var(--brand-dark)]">
                  <span className="mr-1.5 text-xs font-bold uppercase tracking-editorial text-muted-foreground">
                    Q{qIndex + 1}
                  </span>
                  {question.name}
                </p>
                <div className="border-l-2 border-[var(--brand-green)] pl-3">
                  <p className="text-sm italic text-muted-foreground">
                    {question.context}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                {question.options.map((opt) => (
                  <AnswerCard
                    key={opt.score}
                    score={opt.score}
                    label={opt.label}
                    selected={currentAnswers[question.id] === opt.score}
                    onClick={() => handleAnswer(question.id, opt.score)}
                  />
                ))}
              </div>
              {qIndex < section.questions.length - 1 && (
                <div className="mt-2 h-px bg-border" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
          <Button
            variant="outline"
            onClick={() => saveAndNavigate("prev")}
            className="h-11 px-5 transition-all duration-200 hover:scale-[1.02]"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={() => saveAndNavigate("next")}
            disabled={!allQuestionsAnswered}
            className="h-11 bg-[var(--brand-green)] px-6 text-[var(--brand-dark)] hover:bg-[var(--brand-green)]/90 font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
          >
            {sectionNum === 6
              ? "Continue to Channel Health"
              : sectionNum === 7
                ? "Continue to Financial Context"
                : "Next Section"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentLayout>
  );
}
