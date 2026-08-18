"use client";

import { cn } from "@/lib/utils";
import {
  VISUAL_STYLES,
  VISUAL_STYLE_DESCRIPTIONS,
  VisualStyleEnum,
} from "../types/prompt-maker";

const PILL_CLASS =
  "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors";

interface StyleOptionProps {
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

function StyleOption({
  label,
  description,
  isSelected,
  onSelect,
}: StyleOptionProps) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          PILL_CLASS,
          isSelected
            ? "border-primary bg-primary/15 text-foreground"
            : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
        )}
      >
        {label}
      </button>

      {/* Hover card, above the pill */}
      <div className="border-border bg-popover pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-xl border p-3 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        <p className="text-foreground text-xs font-semibold">{label}</p>
        <p className="text-muted-foreground mt-1 text-[11px] leading-snug">
          {description}
        </p>
      </div>
    </div>
  );
}

interface VisualStylePickerProps {
  value: VisualStyleEnum | null;
  onChange: (value: VisualStyleEnum | null) => void;
}

export function VisualStylePicker({ value, onChange }: VisualStylePickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <StyleOption
        label="None"
        description="No specific style — let the model decide how it looks."
        isSelected={value === null}
        onSelect={() => onChange(null)}
      />

      {VISUAL_STYLES.map((style) => (
        <StyleOption
          key={style}
          label={style}
          description={VISUAL_STYLE_DESCRIPTIONS[style]}
          isSelected={value === style}
          onSelect={() => onChange(style)}
        />
      ))}
    </div>
  );
}
