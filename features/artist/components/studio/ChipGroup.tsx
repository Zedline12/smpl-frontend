"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const studioLabel = "text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55";

interface ChipOption<Id extends string> {
  id: Id;
  label: string;
}

interface ChipGroupProps<Id extends string> {
  label: string;
  options: ChipOption<Id>[];
  selected: Id[];
  onChange: (next: Id[]) => void;
  /** 1 = pick one (click again to clear); higher = up to that many. */
  max: number;
  /** "tile": a 4-column grid of buttons; "pill": wrapping rounded chips. */
  variant?: "tile" | "pill";
  /** Show only this many until "More" is clicked (selected ones always show). */
  collapsedCount?: number;
  disabled?: boolean;
}

export const chipBase =
  "border text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-35";
export const chipOn =
  "border-primary bg-primary/20 text-white shadow-[0_0_18px_-8px_var(--color-primary)]";
export const chipOff =
  "border-white/[0.07] bg-white/[0.04] text-white/80 hover:border-white/15 hover:bg-white/[0.08] hover:text-white";

/** A labelled set of choice chips (genres, moods…). */
export function ChipGroup<Id extends string>({
  label,
  options,
  selected,
  onChange,
  max,
  variant = "pill",
  collapsedCount,
  disabled,
}: ChipGroupProps<Id>) {
  const [expanded, setExpanded] = useState(false);
  const single = max === 1;
  const full = !single && selected.length >= max;
  const collapsible = collapsedCount !== undefined && options.length > collapsedCount;
  const shown =
    collapsible && !expanded
      ? options.filter((o, i) => i < collapsedCount || selected.includes(o.id))
      : options;

  const toggle = (id: Id) => {
    if (single) return onChange(selected.includes(id) ? [] : [id]);
    if (selected.includes(id)) return onChange(selected.filter((s) => s !== id));
    if (!full) onChange([...selected, id]);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className={studioLabel}>{label}</span>
        {!single && (
          <span className="text-[11px] tabular-nums text-white/35">
            {selected.length}/{max}
          </span>
        )}
      </div>
      <div className={variant === "tile" ? "grid grid-cols-2 gap-2 sm:grid-cols-4" : "flex flex-wrap gap-2"}>
        {shown.map((o) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              disabled={disabled || (!on && full)}
              onClick={() => toggle(o.id)}
              className={cn(
                chipBase,
                variant === "tile" ? "h-12 rounded-xl px-2" : "h-10 rounded-full px-4",
                on ? chipOn : chipOff,
              )}
            >
              {o.label}
            </button>
          );
        })}
        {collapsible && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              chipBase,
              "border-dashed border-white/15 text-white/55 hover:border-white/30 hover:text-white",
              variant === "tile" ? "h-12 rounded-xl px-2" : "h-10 rounded-full px-4",
            )}
          >
            {expanded ? "Less" : `More (${options.length - collapsedCount})`}
          </button>
        )}
      </div>
    </div>
  );
}

/** One-of choice in a single rail (Vocals, Resolution…). */
export function Segmented<Id extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: ChipOption<Id>[];
  value: Id;
  onChange: (id: Id) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className={studioLabel}>{label}</span>
      <div className="flex flex-wrap gap-1 rounded-2xl border border-white/[0.07] bg-black/30 p-1">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            disabled={disabled}
            onClick={() => onChange(o.id)}
            className={cn(
              "h-11 min-w-[4.5rem] flex-1 rounded-xl border px-3 text-sm font-semibold transition-all disabled:opacity-40",
              value === o.id
                ? "border-primary bg-primary/25 text-white shadow-[0_0_18px_-8px_var(--color-primary)]"
                : "border-transparent text-white/70 hover:text-white",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
