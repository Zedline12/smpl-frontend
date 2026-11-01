"use client";
import { useState } from "react";
import { ChevronRight, LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DiscOption<Id extends string> {
  id: Id;
  label: string;
  emoji?: string;
}

interface DiscMenuButtonProps<Id extends string> {
  icon: LucideIcon;
  label: string;
  options: DiscOption<Id>[];
  selected: Id[];
  onChange: (next: Id[]) => void;
  /** Most options that can be picked at once. */
  max: number;
  disabled?: boolean;
}

const DISC = 320; // disc diameter, px
const BUBBLE = 44; // option bubble diameter, px
const RING = 124; // distance from the center to each bubble's center, px

/** A sidebar row that opens its choices as emoji bubbles around a spinning vinyl disc. */
export function DiscMenuButton<Id extends string>({
  icon: Icon,
  label,
  options,
  selected,
  onChange,
  max,
  disabled,
}: DiscMenuButtonProps<Id>) {
  const [hovered, setHovered] = useState<Id | null>(null);
  const full = selected.length >= max;
  const picked = options.filter((o) => selected.includes(o.id));
  const focus = options.find((o) => o.id === hovered);

  const toggle = (id: Id) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else if (!full) onChange([...selected, id]);
  };

  return (
    <DropdownMenu onOpenChange={(open) => !open && setHovered(null)}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className="group flex h-11 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-left transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40 data-[state=open]:border-white/25 data-[state=open]:bg-white/[0.07]"
        >
          <Icon className={`size-4 shrink-0 ${picked.length ? "text-primary" : "text-white/50"}`} />
          <span className="shrink-0 text-sm font-medium text-white">{label}</span>
          <span
            className={`ml-auto min-w-0 truncate text-xs ${picked.length ? "font-medium text-secondary" : "text-white/35"}`}
          >
            {picked.length
              ? picked.map((o) => `${o.emoji ?? ""} ${o.label}`.trim()).join(", ")
              : "Any"}
          </span>
          <ChevronRight className="size-4 shrink-0 text-white/40 transition-transform group-data-[state=open]:translate-x-0.5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="center"
        sideOffset={14}
        onPointerLeave={() => setHovered(null)}
        style={{ width: DISC, height: DISC }}
        className="data-[state=open]:animate-disc-in relative max-h-none min-w-0 overflow-visible rounded-full border-0 bg-transparent p-0 shadow-none"
      >
        {/* The record: grooves and a sheen that spin, with a primary glow around it. */}
        <div
          aria-hidden
          className="animate-disc-spin absolute inset-0 rounded-full border border-white/10 shadow-[0_0_40px_-8px_var(--color-primary),0_20px_50px_rgba(0,0,0,0.6)]"
          style={{
            background: [
              "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.09) 30deg, transparent 70deg, transparent 180deg, rgba(255,255,255,0.09) 210deg, transparent 250deg)",
              "repeating-radial-gradient(circle at center, #0c0c0f 0 2px, #17171c 2px 4px)",
            ].join(","),
          }}
        />

        {/* Center label */}
        <div
          className="absolute top-1/2 left-1/2 flex size-[132px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full border border-white/15 px-3 text-center"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, color-mix(in oklab, var(--color-primary) 85%, white 10%), color-mix(in oklab, var(--color-primary) 55%, black) 75%)",
          }}
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/70">
            {label}
          </span>
          <span className="flex min-h-[36px] max-w-full flex-col items-center justify-center leading-tight">
            {focus ? (
              <>
                <span className="text-lg">{focus.emoji}</span>
                <span className="truncate text-xs font-bold text-white">{focus.label}</span>
              </>
            ) : (
              <span className="text-xs font-semibold text-white/90">
                {picked.length ? `${picked.length}/${max} picked` : `Pick up to ${max}`}
              </span>
            )}
          </span>
          {/* Spindle hole */}
          <span className="my-0.5 size-2 rounded-full bg-black/80 ring-1 ring-white/20" />
          {picked.length > 0 ? (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onChange([]);
              }}
              className="h-auto cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-semibold text-white/80 focus:bg-black/30 focus:text-white"
            >
              Clear
            </DropdownMenuItem>
          ) : (
            <span className="h-[19px]" />
          )}
        </div>

        {/* Option bubbles around the rim */}
        {options.map((option, i) => {
          const active = selected.includes(option.id);
          const angle = (i / options.length) * 2 * Math.PI - Math.PI / 2;
          const left = DISC / 2 + RING * Math.cos(angle) - BUBBLE / 2;
          const top = DISC / 2 + RING * Math.sin(angle) - BUBBLE / 2;
          return (
            <DropdownMenuItem
              key={option.id}
              aria-label={option.label}
              title={option.label}
              disabled={!active && full}
              // Stays open so several can be picked in one go.
              onSelect={(e) => {
                e.preventDefault();
                toggle(option.id);
              }}
              onPointerEnter={() => setHovered(option.id)}
              onFocus={() => setHovered(option.id)}
              style={{ left, top, width: BUBBLE, height: BUBBLE }}
              className={`group absolute flex cursor-pointer items-center justify-center rounded-full border p-0 text-xl backdrop-blur-sm transition-[scale,background-color,box-shadow,border-color] duration-200 ease-out data-[disabled]:opacity-30 data-[highlighted]:z-10 data-[highlighted]:scale-125 data-[highlighted]:border-primary data-[highlighted]:bg-primary/30 data-[highlighted]:shadow-[0_0_18px_2px_var(--color-primary)] ${
                active
                  ? "border-primary bg-primary/40 shadow-[0_0_14px_var(--color-primary)]"
                  : "border-white/15 bg-black/55"
              }`}
            >
              <span className="group-data-[highlighted]:animate-emoji-wiggle inline-block leading-none">
                {option.emoji ?? option.label.slice(0, 2)}
              </span>
              {active && (
                <span className="bg-secondary absolute -top-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-black" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
