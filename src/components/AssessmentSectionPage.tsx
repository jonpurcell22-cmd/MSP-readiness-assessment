"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAssessmentStore } from "@/lib/store";
import { ASSESSMENT_SECTION_ROUTES } from "@/lib/constants";
import type {
  AssessmentSectionConfig,
  AssessmentQuestionOption,
  SectionScores,
} from "@/types/assessment";

const TOTAL_SECTIONS = 7;
const QUESTIONS_PER_SECTION = 5;
const ACCENT_GREEN_DARK = "#1a9e44";

interface AnswerOption {
  score: number;
  label: string;
}

interface AssessmentQuestionCardProps {
  questionNumber?: number;
  totalQuestions?: number;
  title: string;
  context: string;
  options: AnswerOption[];
  value?: number | null;
  onChange?: (score: number) => void;
  hasError?: boolean;
}

function AssessmentQuestionCard({
  questionNumber,
  totalQuestions = 5,
  title,
  context,
  options,
  value: controlledValue,
  onChange,
  hasError,
}: AssessmentQuestionCardProps) {
  const [internalValue, setInternalValue] = useState<number | null>(null);
  const selected =
    controlledValue !== undefined && controlledValue !== null && controlledValue > 0
      ? controlledValue
      : internalValue;

  function handleSelect(score: number) {
    setInternalValue(score);
    onChange?.(score);
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        {questionNumber != null && totalQuestions != null && (
          <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            {"Question " + questionNumber + " of " + totalQuestions}
          </span>
        )}
        <h3 className="font-serif text-xl font-bold leading-snug tracking-tight text-[#1b3a5c] text-balance">
          {title}
        </h3>
        <p className="mt-2 text-sm italic leading-relaxed text-gray-600">
          {context}
        </p>
      </div>

      <div
        className={cn(
          "grid grid-cols-5 gap-3 rounded-lg transition-colors",
          hasError && "ring-2 ring-red-500 ring-offset-2 rounded-lg"
        )}
      >
        {options.map((option) => {
          const isSelected = selected === option.score;
          return (
            <button
              key={option.score}
              type="button"
              onClick={() => handleSelect(option.score)}
              className={cn(
                "group relative flex flex-col items-start rounded-lg border px-4 py-4 text-left transition-all duration-200 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4cf37b] focus-visible:ring-offset-2",
                isSelected
                  ? "border-l-[3px] border-l-[#4cf37b] border-t-[#4cf37b]/30 border-r-[#4cf37b]/30 border-b-[#4cf37b]/30 bg-[#4cf37b]/[0.06] shadow-sm"
                  : "border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
              )}
              aria-pressed={isSelected}
              aria-label={`Score ${option.score}: ${option.label}`}
            >
              <span
                className={cn(
                  "mb-2 font-serif text-2xl font-bold transition-colors duration-200",
                  isSelected ? "text-[#1a9e44]" : "text-[#1b3a5c]/30 group-hover:text-[#1b3a5c]/50"
                )}
              >
                {option.score}
              </span>
              <span
                className={cn(
                  "text-[13px] font-medium leading-snug transition-colors duration-200",
                  isSelected ? "text-[#1b3a5c]" : "text-gray-500 group-hover:text-[#1b3a5c]/80"
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isSectionComplete(sectionScores: SectionScores | null): boolean {
  if (!sectionScores) return false;
  const keys: (keyof SectionScores)[] = ["q1", "q2", "q3", "q4", "q5"];
  for (const key of keys) {
    const value = sectionScores[key];
    if (value == null || value < 1 || value > 5) return false;
  }
  return true;
}

function mapOptions(options: AssessmentQuestionOption[]): AnswerOption[] {
  return options.map((o) => ({ score: o.score, label: o.shortLabel }));
}

export function AssessmentSection({ config }: { config: AssessmentSectionConfig }) {
  const router = useRouter();
  const { sectionKey, sectionNumber, title, description, questions } = config;
  const sectionScores = useAssessmentStore((s) => s[sectionKey]);
  const setSectionScores = useAssessmentStore((s) => s.setSectionScores);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const prevHref =
    sectionNumber === 1 ? "/" : ASSESSMENT_SECTION_ROUTES[sectionNumber - 2];
  const nextHref =
    sectionNumber === TOTAL_SECTIONS
      ? "/assessment/financials"
      : ASSESSMENT_SECTION_ROUTES[sectionNumber];

  const allAnswered = isSectionComplete(sectionScores ?? null);

  useEffect(() => {
    if (allAnswered) setShowValidationErrors(false);
  }, [allAnswered]);

  const handleNext = () => {
    if (allAnswered) {
      setShowValidationErrors(false);
      router.push(nextHref);
    } else {
      setShowValidationErrors(true);
    }
  };

  const progressPct = (sectionNumber / TOTAL_SECTIONS) * 100;

  return (
    <main className="min-h-screen bg-[#f4f7fa] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Section {sectionNumber} of {TOTAL_SECTIONS}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, backgroundColor: ACCENT_GREEN_DARK }}
            />
          </div>
        </div>

        <header className="mb-8">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1b3a5c] sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {description}
          </p>
        </header>

        {showValidationErrors && !allAnswered && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            Please answer all questions before continuing.
          </div>
        )}

        <div className="space-y-12">
          {questions.map((question, index) => {
            const questionKey = question.questionKey as keyof SectionScores;
            const value = sectionScores?.[questionKey] ?? null;
            const isUnanswered = value == null || value < 1 || value > 5;
            const hasError = showValidationErrors && isUnanswered;
            return (
              <AssessmentQuestionCard
                key={question.questionKey}
                questionNumber={index + 1}
                totalQuestions={QUESTIONS_PER_SECTION}
                title={question.name}
                context={question.context}
                options={mapOptions(question.options)}
                value={value}
                onChange={(score) =>
                  setSectionScores(sectionKey, { [question.questionKey]: score })
                }
                hasError={hasError}
              />
            );
          })}
        </div>

        <nav className="mt-12 flex justify-between gap-4" style={{ flexDirection: "row" }}>
          <span className="flex justify-start">
            <Link
              href={prevHref}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-[#1b3a5c] hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4cf37b] focus-visible:ring-offset-2"
            >
              ← Previous
            </Link>
          </span>
          <span className="flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#4cf37b] focus:ring-offset-2",
                allAnswered
                  ? "cursor-pointer bg-[#1a9e44] hover:opacity-90"
                  : "cursor-pointer bg-[#1a9e44]/60 text-white/90 hover:bg-[#1a9e44]/70"
              )}
            >
              Next →
            </button>
          </span>
        </nav>
      </div>
    </main>
  );
}
