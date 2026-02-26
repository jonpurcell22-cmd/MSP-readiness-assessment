import { cn } from "@/lib/utils";

export function ScoreBar({
  score,
  max,
  className,
}: {
  score: number;
  max: number;
  className?: string;
}) {
  const percentage = Math.round((score / max) * 100);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#E5E5E5]">
        <div
          className="h-full rounded-full bg-[#4cf37b] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="min-w-[3rem] text-right text-sm font-semibold text-[#333333]">
        {score}/{max}
      </span>
    </div>
  );
}
