"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScoreBar } from "@/components/score-bar"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { Section } from "@/lib/assessment-data"
import { cn } from "@/lib/utils"

export function SectionResultCard({
  section,
  score,
  interpretation,
  answers,
}: {
  section: Section
  score: number
  interpretation: string
  answers: Record<string, number>
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card
      className={cn(
        "border-l-4 border-l-[var(--brand-green)] bg-card shadow-sm transition-all duration-200",
        "hover:shadow-md",
        !expanded && "cursor-pointer"
      )}
      onClick={() => !expanded && setExpanded(true)}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--brand-dark)]">
              {section.title}
            </h3>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(!expanded)
              }}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                expanded
                  ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                  : "text-[var(--brand-dark)] bg-[var(--brand-green)]/10 hover:bg-[var(--brand-green)]/20"
              )}
            >
              {expanded ? "Hide" : "View details"}
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
          <ScoreBar score={score} max={25} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {interpretation}
        </p>
        {expanded && (
          <div className="animate-fade-in-up flex flex-col gap-3 rounded-lg bg-[var(--brand-subtle)] p-4">
            {section.questions.map((q) => {
              const selectedScore = answers[q.id]
              return (
                <div
                  key={q.id}
                  className="flex items-start justify-between gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <p className="text-sm text-foreground">{q.name}</p>
                  <span className="shrink-0 rounded-full bg-[var(--brand-green)]/15 px-2.5 py-0.5 text-xs font-bold tabular-nums text-[var(--brand-dark)]">
                    {selectedScore !== undefined ? selectedScore : "-"}/5
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
