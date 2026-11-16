import type React from "react";
import { cn } from "@/lib/utils";
import { cardClass } from "./palette";

/** A titled card for one chart. */
export function ChartCard({
  title,
  subtitle,
  className,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(cardClass, "p-5 min-w-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-white">{title}</p>
          {subtitle && <p className="text-[12px] text-white/40 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** Series legend: a swatch (or a line) and the name, in text ink (never the series color). */
export function Legend({ items }: { items: { label: string; color: string; line?: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5 text-[12px] text-white/60">
          <span
            className={cn("inline-block", i.line ? "w-3.5 h-0.5 rounded-full" : "w-2.5 h-2.5 rounded-[3px]")}
            style={{ background: i.color }}
          />
          {i.label}
        </span>
      ))}
    </div>
  );
}

/** Hover tooltip body: a heading and one row per value. */
export function TooltipBox({
  active,
  label,
  rows,
}: {
  active?: boolean;
  label?: string;
  rows: { label: string; value: string; color?: string; bold?: boolean }[];
}) {
  if (!active) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1f1f1f] px-3 py-2.5 shadow-xl text-[12px] min-w-[170px]">
      {label && <p className="font-semibold text-white mb-1.5">{label}</p>}
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-white/60">
              {r.color && <span className="w-2 h-2 rounded-[2px]" style={{ background: r.color }} />}
              {r.label}
            </span>
            <span className={cn("tabular-nums text-white", r.bold && "font-bold")}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
