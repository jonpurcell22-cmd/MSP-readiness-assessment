"use client";

import { cn } from "@/lib/utils";

interface AnswerCardProps {
  score: number;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function AnswerCard({ score, label, selected, onClick }: AnswerCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start rounded-lg border-2 p-3 text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-green)] focus-visible:ring-offset-2",
        "hover:-translate-y-0.5 hover:border-[var(--brand-green)] hover:bg-[var(--brand-green)]/5 hover:shadow-md",
        selected
          ? "border-l-4 border-[var(--brand-green)] bg-[var(--brand-green)]/8 shadow-md scale-[1.02]"
          : "border-border bg-card"
      )}
      aria-pressed={selected}
    >
      <span
        className={cn(
          "mb-1 tabular-nums transition-all",
          selected
            ? "text-base font-extrabold text-[var(--brand-green)]"
            : "text-xs font-bold text-muted-foreground"
        )}
      >
        {score}
      </span>
      <span
        className={cn(
          "text-sm leading-snug transition-colors",
          selected ? "font-semibold text-[var(--brand-dark)]" : "text-foreground"
        )}
      >
        {label}
      </span>
    </button>
  );
}
