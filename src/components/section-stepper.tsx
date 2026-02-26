"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const sectionNames = [
  "Pricing & Economics",
  "Product Architecture",
  "Organization & GTM",
  "Partner Ecosystem",
  "Enablement",
  "Competitive Landscape",
  "Channel Health",
]

export function SectionStepper({ currentSection }: { currentSection: number }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {sectionNames.map((name, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < currentSection
        const isCurrent = stepNum === currentSection

        return (
          <div key={name} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                  isCompleted && "bg-[var(--brand-green)] text-[var(--brand-dark)]",
                  isCurrent && "bg-[var(--brand-dark)] text-white ring-2 ring-[var(--brand-green)] ring-offset-2",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : stepNum}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-[10px] font-semibold tracking-editorial transition-colors",
                  isCurrent
                    ? "text-[var(--brand-dark)]"
                    : isCompleted
                      ? "text-[var(--brand-dark)]/70"
                      : "text-muted-foreground"
                )}
              >
                {name}
              </span>
            </div>
            {i < sectionNames.length - 1 && (
              <div
                className={cn(
                  "mx-1 mt-[-18px] h-[2px] w-5 transition-colors duration-300 sm:w-8",
                  isCompleted ? "bg-[var(--brand-green)]" : "bg-muted"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
