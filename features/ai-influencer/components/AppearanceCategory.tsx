"use client";
import { ChevronDown } from "lucide-react";
import type { ComponentType } from "react";
import {
  AiInfluencerCategory,
  AiInfluencerOption,
} from "../hooks/useAiInfluencerOptions";

interface AppearanceCategoryProps {
  category: AiInfluencerCategory;
  icon?: ComponentType<{ className?: string }>;
  selected: string[];
  open: boolean;
  onToggleOpen: () => void;
  onToggleOption: (option: AiInfluencerOption) => void;
  onClear: () => void;
}

export default function AppearanceCategory({
  category,
  icon: Icon,
  selected,
  open,
  onToggleOpen,
  onToggleOption,
  onClear,
}: AppearanceCategoryProps) {
  const selectedLabels = category.options
    .filter((o) => selected.includes(o.key))
    .map((o) => o.label);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex h-11 w-full items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 text-left transition-colors hover:bg-white/[0.07]"
      >
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
        <span className="flex-1 text-sm font-medium text-foreground">
          {category.label}
          <span className="ml-1.5 text-xs text-muted-foreground">
            · {category.options.length}
          </span>
        </span>
        {!open && selectedLabels[0] && (
          <span className="max-w-[72px] truncate rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-muted-foreground">
            {selectedLabels[0]}
          </span>
        )}
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="px-1 pt-2 pb-3">
          <div className="grid grid-cols-3 gap-2">
            {category.options.map((option) => (
              <OptionTile
                key={option.key}
                option={option}
                active={selected.includes(option.key)}
                onClick={() => onToggleOption(option)}
              />
            ))}
          </div>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function OptionTile({
  option,
  active,
  onClick,
}: {
  option: AiInfluencerOption;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={option.label}
      className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.06] p-2 text-center transition-colors hover:bg-white/10"
      style={active ? { outline: "2px solid #d4ff00", outlineOffset: "0px" } : undefined}
    >
      {option.color ? (
        <span
          className="aspect-square w-full rounded-full border border-white/10"
          style={{ backgroundColor: option.color }}
        />
      ) : option.img ? (
        <img
          src={option.img}
          alt={option.label}
          loading="lazy"
          className="aspect-square w-full rounded-lg object-cover"
        />
      ) : (
        <span className="flex aspect-square w-full items-center justify-center rounded-lg bg-white/10 text-[13px] font-semibold text-foreground/60">
          {option.label.charAt(0)}
        </span>
      )}
      <span className="line-clamp-2 text-[11px] leading-tight text-foreground/90">
        {option.label}
      </span>
    </button>
  );
}
