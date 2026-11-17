"use client";
import { useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { studioLabel } from "./ChipGroup";

const SWEEP = 270;
const START = -SWEEP / 2;
/** Pixels of vertical drag per step, at most. */
const MAX_STEP_PX = 28;

const point = (r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return [50 + r * Math.sin(rad), 50 - r * Math.cos(rad)] as const;
};
const arc = (r: number, from: number, to: number) => {
  const [x1, y1] = point(r, from);
  const [x2, y2] = point(r, to);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
};

interface KnobProps {
  label: string;
  /** Number of positions; the knob snaps to them. */
  steps: number;
  index: number;
  onChange: (index: number) => void;
  /** What the value pill shows. */
  display: ReactNode;
  /** Read out by screen readers. */
  valueText: string;
  disabled?: boolean;
  hint?: string;
  /** "md": the panel knob with a slider; "sm": a small dial for the mobile dock. */
  size?: "md" | "sm";
}

/** A studio knob (drag up/down or arrow keys) with its value and a slider under it. */
export function Knob({
  label,
  steps,
  index,
  onChange,
  display,
  valueText,
  disabled,
  hint,
  size = "md",
}: KnobProps) {
  const small = size === "sm";
  const gradientId = `knob${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const drag = useRef<{ y: number; index: number } | null>(null);
  const last = steps - 1;
  const fraction = last > 0 ? index / last : 0;
  const angle = START + SWEEP * fraction;
  const stepPx = Math.min(MAX_STEP_PX, 160 / Math.max(1, last));
  const clamp = (i: number) => Math.min(last, Math.max(0, i));
  const set = (i: number) => {
    const next = clamp(i);
    if (next !== index) onChange(next);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center",
        small ? "shrink-0 gap-1" : "w-full gap-2",
        disabled && "opacity-45",
      )}
    >
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={index}
        aria-valuetext={valueText}
        aria-disabled={disabled}
        onPointerDown={(e) => {
          if (disabled) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { y: e.clientY, index };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          set(
            drag.current.index +
              Math.round((drag.current.y - e.clientY) / stepPx),
          );
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={(e) => {
          if (disabled) return;
          const delta = {
            ArrowUp: 1,
            ArrowRight: 1,
            ArrowDown: -1,
            ArrowLeft: -1,
          }[e.key];
          if (delta) set(index + delta);
          else if (e.key === "Home") set(0);
          else if (e.key === "End") set(last);
          else return;
          e.preventDefault();
        }}
        className={cn(
          small ? "size-12" : "aspect-square w-full max-w-20",
          "touch-none rounded-full select-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none",
          disabled ? "cursor-not-allowed" : "cursor-ns-resize",
        )}
      >
        <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="1" y1="1" y2="0">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-secondary)" />
            </linearGradient>
            <radialGradient id={`${gradientId}k`} cx="40%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#3a3a48" />
              <stop offset="100%" stopColor="#111118" />
            </radialGradient>
          </defs>
          <path
            d={arc(46, START, START + SWEEP)}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          {fraction > 0 && (
            <path
              d={arc(46, START, angle)}
              stroke={`url(#${gradientId})`}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          )}
          <circle
            cx="50"
            cy="50"
            r="37"
            fill={`url(#${gradientId}k)`}
            stroke="rgba(255,255,255,0.06)"
          />
          <line
            x1={point(17, angle)[0]}
            y1={point(17, angle)[1]}
            x2={point(28, angle)[0]}
            y2={point(28, angle)[1]}
            stroke="var(--color-primary)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {small ? (
        <span className="flex flex-col items-center leading-tight">
          <span className="text-[9px] font-semibold tracking-[0.12em] text-white/55 uppercase">
            {label}
          </span>
          <span className="text-[10px] font-semibold tabular-nums text-white">
            {display}
          </span>
        </span>
      ) : (
        <>
          <span className={studioLabel}>{label}</span>
          <span className="min-w-20 rounded-md border border-white/10 bg-black/40 px-2.5 py-1 text-center text-xs font-semibold tabular-nums text-white">
            {display}
          </span>
          <input
            type="range"
            min={0}
            max={last}
            step={1}
            value={index}
            disabled={disabled}
            onChange={(e) => set(Number(e.target.value))}
            aria-label={`${label} slider`}
            className="accent-primary w-full cursor-pointer disabled:cursor-not-allowed"
          />
          {hint && (
            <span className="-mt-1 text-[11px] text-white/40">{hint}</span>
          )}
        </>
      )}
    </div>
  );
}
