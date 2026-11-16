import { cn } from "@/lib/utils";

/** Bouncing bars while something plays; still bars otherwise. */
export function Equalizer({
  active,
  bars = 4,
  className,
  barClassName = "w-[3px]",
}: {
  active: boolean;
  bars?: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <span aria-hidden className={cn("flex h-4 items-end gap-[3px]", className)}>
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className={cn("h-full origin-bottom rounded-full", barClassName)}
          style={{
            background: "linear-gradient(to top, var(--color-primary), var(--color-secondary))",
            transform: active ? undefined : `scaleY(${[0.45, 0.8, 0.6, 0.95, 0.5][i % 5]})`,
            animation: active ? `artist-eq ${0.7 + (i % 3) * 0.18}s ease-in-out ${i * 0.09}s infinite` : undefined,
          }}
        />
      ))}
    </span>
  );
}
