import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Accent = "blue" | "violet" | "emerald" | "red" | "cyan" | "orange" | "amber" | "sky";

export const ACCENTS: Record<Accent, { card: string; icon: string }> = {
  blue: { card: "bg-blue-500/[0.06] border-blue-500/15", icon: "bg-blue-500/15 text-blue-400" },
  violet: { card: "bg-violet-500/[0.07] border-violet-500/15", icon: "bg-violet-500/15 text-violet-400" },
  emerald: { card: "bg-emerald-500/[0.06] border-emerald-500/15", icon: "bg-emerald-500/15 text-emerald-400" },
  red: { card: "bg-red-500/[0.06] border-red-500/15", icon: "bg-red-500/15 text-red-400" },
  cyan: { card: "bg-cyan-500/[0.06] border-cyan-500/15", icon: "bg-cyan-500/15 text-cyan-400" },
  orange: { card: "bg-orange-500/[0.06] border-orange-500/15", icon: "bg-orange-500/15 text-orange-400" },
  amber: { card: "bg-amber-500/[0.06] border-amber-500/15", icon: "bg-amber-500/15 text-amber-400" },
  sky: { card: "bg-sky-500/[0.06] border-sky-500/15", icon: "bg-sky-500/15 text-sky-400" },
};

/** A tinted KPI tile: label, big value, optional footnote, icon. */
export function KpiTile({
  label,
  value,
  accent,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  value: string;
  accent: Accent;
  icon: LucideIcon;
  children?: ReactNode;
  className?: string;
}) {
  const a = ACCENTS[accent];
  return (
    <div className={cn("flex min-w-0 items-center gap-3 rounded-2xl border p-5", a.card, className)}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-white/55">{label}</p>
        <p className="mt-2.5 truncate text-[28px] leading-none font-bold text-white tabular-nums">{value}</p>
        {children && <div className="mt-3 text-[12px] leading-snug text-white/40">{children}</div>}
      </div>
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", a.icon)}>
        <Icon className="size-5" />
      </div>
    </div>
  );
}

/** Change vs the previous period; `goodWhenUp` false for costs and failures. */
export function DeltaText({
  now,
  before,
  goodWhenUp = true,
}: {
  now: number;
  before: number | null | undefined;
  goodWhenUp?: boolean;
}) {
  if (before === null || before === undefined) return null;
  if (!before && !now) return <span className="text-white/35">No change</span>;
  const diff = now - before;
  if (diff === 0) return <span className="text-white/35">Same as before</span>;
  const up = diff > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-semibold", up === goodWhenUp ? "text-emerald-400" : "text-red-400")}>
      <Icon className="size-3.5" />
      {before ? `${Math.abs((diff / before) * 100).toFixed(0)}%` : "new"}
      <span className="ml-1 font-normal text-white/35">vs before</span>
    </span>
  );
}
