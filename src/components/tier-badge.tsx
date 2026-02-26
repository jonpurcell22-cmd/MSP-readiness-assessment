import { cn } from "@/lib/utils"

const tierColors: Record<string, string> = {
  "MSP Premature": "bg-[#EF4444] text-white",
  "MSP Emerging": "bg-[#F59E0B] text-white",
  "MSP Capable": "bg-[#4cf37b] text-white",
  "MSP Ready": "bg-[#4cf37b] text-white",
}

export function TierBadge({
  tier,
  className,
}: {
  tier: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
        tierColors[tier] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {tier}
    </span>
  )
}
