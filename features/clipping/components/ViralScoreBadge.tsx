import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseViralScore } from "../utils";

const BADGE_CLASS =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold";

export function ViralScoreBadge({
  score,
  className,
}: {
  score: string | null | undefined;
  className?: string;
}) {
  const value = parseViralScore(score);

  if (value === null) {
    return (
      <span
        className={cn(
          BADGE_CLASS,
          "bg-foreground/10 text-muted-foreground",
          className,
        )}
      >
        No score
      </span>
    );
  }

  const tone =
    value >= 80
      ? "bg-green-500/15 text-green-500"
      : value >= 50
        ? "bg-amber-500/15 text-amber-500"
        : "bg-foreground/10 text-muted-foreground";

  return (
    <span className={cn(BADGE_CLASS, tone, className)}>
      <Flame className="size-3" />
      {value}
    </span>
  );
}
