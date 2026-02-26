"use client";

import { sections } from "@/lib/assessment-data";

const MAX_SCORE = 25;
const SIZE = 240;
const CENTER = SIZE / 2;

/** Renders a simple radar chart for section scores (section1..section7, 0–25 each). */
export function ResultsRadarChart({
  sectionScores,
}: {
  sectionScores: Record<string, number>;
}) {
  const count = sections.length;
  const radius = CENTER - 24;

  const points = sections.map((section, i) => {
    const score = sectionScores[section.id] ?? 0;
    const normalized = Math.min(1, Math.max(0, score / MAX_SCORE));
    const r = normalized * radius;
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    return {
      x: CENTER + r * Math.cos(angle),
      y: CENTER + r * Math.sin(angle),
      label: section.title,
      score,
    };
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const axisPoints = sections.map((_, i) => {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    const x = CENTER + radius * Math.cos(angle);
    const y = CENTER + radius * Math.sin(angle);
    return { x, y };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="overflow-visible"
      >
        {/* Grid circles */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <circle
            key={scale}
            cx={CENTER}
            cy={CENTER}
            r={radius * scale}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}
        {/* Axis lines */}
        {axisPoints.map((p, i) => (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={p.x}
            y2={p.y}
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}
        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="var(--brand-green)"
          fillOpacity="0.25"
          stroke="var(--brand-green)"
          strokeWidth="2"
        />
      </svg>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#333333]/80 sm:grid-cols-3">
        {points.map((p, i) => (
          <li key={i}>
            <span className="font-medium text-[#333333]">{p.score}/25</span>{" "}
            {p.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
