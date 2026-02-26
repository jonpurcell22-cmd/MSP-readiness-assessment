"use client";

import { useEffect, useState, useRef } from "react";

const tierColors: Record<string, string> = {
  "MSP Premature": "#EF4444",
  "MSP Emerging": "#F59E0B",
  "MSP Capable": "#4cf37b",
  "MSP Ready": "#4cf37b",
  "MSP Program Ready": "#4cf37b",
};

const confettiColors = [
  "#4cf37b",
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#333333",
];

function ConfettiBurst() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    delay: Math.random() * 0.5,
    duration: 0.8 + Math.random() * 0.6,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    size: 4 + Math.random() * 4,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute left-1/2 top-1/2"
          style={{
            width: p.size,
            height: p.size,
            borderRadius: p.size > 6 ? "2px" : "50%",
            backgroundColor: p.color,
            animation: `confettiFall ${p.duration}s ease-out ${p.delay}s both`,
            transform: `translateX(${p.x}px)`,
          }}
        />
      ))}
    </div>
  );
}

export function ScoreGauge({
  score,
  max,
  tier,
}: {
  score: number;
  max: number;
  tier: string;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasAnimated = useRef(false);
  const color = tierColors[tier] || "#4cf37b";
  const percentage = (animatedScore / max) * 100;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 1200;
    const steps = 40;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), score);
      setAnimatedScore(current);
      if (step >= steps) {
        clearInterval(interval);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center">
      {showConfetti && <ConfettiBurst />}
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        className="animate-ring-pulse -rotate-90"
      >
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#f0f0f0"
          strokeWidth="12"
        />
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-bold tabular-nums text-[#333333]">
          {animatedScore}
        </span>
        <span className="text-sm text-[#333333]/70">
          {"out of "}
          {max}
        </span>
      </div>
    </div>
  );
}
