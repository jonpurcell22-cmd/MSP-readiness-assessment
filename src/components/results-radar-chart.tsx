"use client"

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { sections } from "@/lib/assessment-data"
import type { SectionTotals } from "@/types/assessment"

const shortLabels: Record<string, string> = {
  section_1: "Pricing & Econ",
  section_2: "Product Arch",
  section_3: "Org & GTM",
  section_4: "Partner Eco",
  section_5: "Enablement",
  section_6: "Competitive",
  section_7: "Channel Health",
}

export function ResultsRadarChart({
  sectionScores,
}: {
  sectionScores: SectionTotals
}) {
  const data = sections.map((s) => ({
    subject: shortLabels[s.id] || s.title,
    score: sectionScores[s.id] ?? 0,
    fullMark: 25,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="#E5E5E5" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 12, fill: "#333" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 25]}
          tick={{ fontSize: 10, fill: "#999" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E5E5E5",
            borderRadius: "8px",
            fontSize: 13,
          }}
          formatter={(value: number | undefined) => [`${value ?? 0}/25`, "Score"]}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#4cf37b"
          fill="#4cf37b"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
