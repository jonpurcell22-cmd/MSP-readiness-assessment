"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssessmentStore } from "@/lib/store";
import { ASSESSMENT_SECTION_ROUTES } from "@/lib/constants";
import type { AssessmentSectionConfig, AssessmentQuestionOption } from "@/types/assessment";

const TOTAL_SECTIONS = 7;
const QUESTIONS_PER_SECTION = 5;

function isSectionComplete(sectionScores: Record<string, number> | null): boolean {
  if (!sectionScores) return false;
  for (let q = 1; q <= QUESTIONS_PER_SECTION; q++) {
    const key = `q${q}` as keyof typeof sectionScores;
    const value = sectionScores[key];
    if (value == null || value < 1 || value > 5) return false;
  }
  return true;
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
    <main className="min-h-screen bg-[#F4F7FA] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        {/* Progress */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#1B3A5C]/80">
            Section {sectionNumber} of {TOTAL_SECTIONS}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#1A8A7D] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Section header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#1B3A5C] sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-[#1B3A5C]/80">{description}</p>
        </header>

        {/* Validation message */}
        {showValidationErrors && !allAnswered && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            Please answer all questions before continuing.
          </div>
        )}

        {/* Questions */}
        <div className="space-y-10">
          {questions.map((question) => {
            const value = sectionScores?.[question.questionKey as keyof typeof sectionScores] ?? 0;
            const isUnanswered = value < 1 || value > 5;
            const hasError = showValidationErrors && isUnanswered;
            return (
              <QuestionBlock
                key={question.questionKey}
                question={question}
                value={value}
                hasError={hasError}
                onChange={(score) =>
                  setSectionScores(sectionKey, { [question.questionKey]: score })
                }
              />
            );
          })}
        </div>

        {/* Navigation */}
        <nav className="mt-12 flex justify-between gap-4" style={{ flexDirection: "row" }}>
          <span className="flex justify-start">
            <Link
              href={prevHref}
              className="inline-flex items-center justify-center rounded-lg border border-[#1B3A5C]/30 bg-white px-6 py-3 font-medium text-[#1B3A5C] hover:bg-[#1B3A5C]/5"
            >
              ← Previous
            </Link>
          </span>
          <span className="flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className={`inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#1A8A7D] focus:ring-offset-2 ${
                allAnswered
                  ? "bg-[#1A8A7D] hover:bg-[#157a6e] cursor-pointer"
                  : "cursor-pointer bg-[#1A8A7D]/50 text-white/90 hover:bg-[#1A8A7D]/60"
              }`}
            >
              Next →
            </button>
          </span>
        </nav>
      </div>
    </main>
  );
}

function QuestionBlock({
  question,
  value,
  hasError,
  onChange,
}: {
  question: {
    name: string;
    context: string;
    questionKey: string;
    options: AssessmentQuestionOption[];
  };
  value: number;
  hasError?: boolean;
  onChange: (score: number) => void;
}) {
  return (
    <fieldset
      className={`rounded-xl border-2 bg-white p-5 shadow-sm sm:p-6 ${
        hasError ? "border-red-500" : "border-gray-200"
      }`}
    >
      <h2 className="text-lg font-semibold text-[#1B3A5C]">{question.name}</h2>
      <p className="mt-1 text-sm text-[#1B3A5C]/70">{question.context}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-5">
        {question.options.map((option) => (
          <OptionCard
            key={option.score}
            name={question.questionKey}
            option={option}
            selected={value === option.score}
            onSelect={() => onChange(option.score)}
          />
        ))}
      </div>
    </fieldset>
  );
}

function OptionCard({
  name,
  option,
  selected,
  onSelect,
}: {
  name: string;
  option: AssessmentQuestionOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
        selected
          ? "border-[#1A8A7D] bg-[#1A8A7D]/10 ring-2 ring-[#1A8A7D]/30"
          : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={option.score}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span className="text-sm font-semibold text-[#1B3A5C]">{option.score}</span>
      <p className="mt-1.5 text-sm leading-snug text-[#1B3A5C]/90">
        {option.shortLabel}
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs font-medium text-[#1A8A7D] hover:underline">
          Read full description
        </summary>
        <p className="mt-2 text-xs text-[#1B3A5C]/80" title={option.fullDescription}>
          {option.fullDescription}
        </p>
      </details>
    </label>
  );
}
