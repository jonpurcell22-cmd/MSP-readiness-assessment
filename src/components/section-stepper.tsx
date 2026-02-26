"use client";

import { cn } from "@/lib/utils";
import { sections } from "@/lib/assessment-data";

/** Short labels for the stepper (fit in a compact row). */
const STEPPER_LABELS: Record<number, string> = {
  1: "Product",
  2: "Pricing",
  3: "Org & GTM",
  4: "Ecosystem",
  5: "Enablement",
  6: "Competitive",
  7: "Channel Health",
};

export function SectionStepper({ currentSection }: { currentSection: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {sections.map((section, i) => {
        const num = i + 1;
        const label = STEPPER_LABELS[num] ?? section.title;
        const isCurrent = num === currentSection;
        return (
          <div
            key={section.id}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm",
              isCurrent
                ? "bg-[#4cf37b] text-[#333333]"
                : "bg-[#E5E5E5] text-[#333333]/70"
            )}
            aria-current={isCurrent ? "step" : undefined}
            title={section.title}
          >
            <span className="font-semibold">{num}</span>
            <span className="ml-1.5 hidden sm:inline">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
