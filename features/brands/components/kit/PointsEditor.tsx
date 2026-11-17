"use client";
import { useRef } from "react";
import { Plus, X } from "lucide-react";
import { BRAND_LIMITS } from "../../types";

/**
 * Selling points as editable lines with an accent bar. Enter adds a line below,
 * Backspace on an empty line removes it.
 */
export function PointsEditor({
  points,
  onChange,
  placeholder,
  max = BRAND_LIMITS.sellingPoints,
}: {
  points: string[];
  onChange: (points: string[]) => void;
  placeholder: string;
  max?: number;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  // Always show at least one line to type into.
  const lines = points.length ? points : [""];
  const focus = (i: number) =>
    requestAnimationFrame(() => refs.current[i]?.focus());

  const set = (i: number, value: string) =>
    onChange(lines.map((p, j) => (j === i ? value : p)));
  const insertAfter = (i: number) => {
    if (lines.length >= max) return;
    onChange([...lines.slice(0, i + 1), "", ...lines.slice(i + 1)]);
    focus(i + 1);
  };
  const remove = (i: number) => {
    const next = lines.filter((_, j) => j !== i);
    onChange(next.length ? next : []);
    focus(Math.max(0, i - 1));
  };

  return (
    <div className="flex flex-col">
      {lines.map((point, i) => (
        <div
          key={i}
          className="group flex items-center gap-3 border-b border-white/[0.06] py-1.5 last:border-b-0"
        >
          <span className="bg-primary h-5 w-0.5 shrink-0 rounded-full" />
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={point}
            maxLength={BRAND_LIMITS.item}
            placeholder={i === 0 ? placeholder : "Another reason to buy"}
            aria-label={`Selling point ${i + 1}`}
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                insertAfter(i);
              } else if (e.key === "Backspace" && !point && lines.length > 1) {
                e.preventDefault();
                remove(i);
              }
            }}
            className="min-w-0 flex-1 bg-transparent py-1 text-[15px] text-white outline-none placeholder:text-white/30"
          />
          {(point || lines.length > 1) && (
            <button
              type="button"
              aria-label={`Remove selling point ${i + 1}`}
              onClick={() => remove(i)}
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-white/35 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10 hover:text-white focus:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      ))}
      {lines.length < max && lines[lines.length - 1] !== "" && (
        <button
          type="button"
          onClick={() => insertAfter(lines.length - 1)}
          className="mt-2 flex w-fit items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white"
        >
          <Plus className="size-3.5" /> Add selling point
        </button>
      )}
    </div>
  );
}
