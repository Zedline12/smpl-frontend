"use client";
import { Check, ChevronRight, LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MENU_CONTENT_CLASS } from "@/features/media/components/actions/MediaCardActions";

interface MenuOption<Id extends string> {
  id: Id;
  label: string;
}

interface StyleMenuButtonProps<Id extends string> {
  icon: LucideIcon;
  label: string;
  options: MenuOption<Id>[];
  selected: Id[];
  onChange: (next: Id[]) => void;
  /** 1 = pick one (or none); higher = pick up to that many. */
  max?: number;
  /** Text shown when nothing is picked. */
  emptyLabel?: string;
  disabled?: boolean;
  /** Extra classes for the row button (e.g. a transparent background). */
  triggerClassName?: string;
}

/** A sidebar row that opens its choices in a menu to the right. */
export function StyleMenuButton<Id extends string>({
  icon: Icon,
  label,
  options,
  selected,
  onChange,
  max,
  emptyLabel = "Any",
  disabled,
  triggerClassName,
}: StyleMenuButtonProps<Id>) {
  const single = max === 1;
  const full = max !== undefined && !single && selected.length >= max;
  const summary = selected.length
    ? options
        .filter((o) => selected.includes(o.id))
        .map((o) => o.label)
        .join(", ")
    : emptyLabel;

  const toggle = (id: Id) => {
    if (single) return onChange(selected.includes(id) ? [] : [id]);
    if (selected.includes(id)) return onChange(selected.filter((s) => s !== id));
    if (!full) onChange([...selected, id]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "group flex h-11 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-left transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40 data-[state=open]:border-white/25 data-[state=open]:bg-white/[0.07]",
            triggerClassName,
          )}
        >
          <Icon className={`size-4 shrink-0 ${selected.length ? "text-primary" : "text-white/50"}`} />
          <span className="shrink-0 text-sm font-medium text-white">{label}</span>
          <span
            className={`ml-auto min-w-0 truncate text-xs ${selected.length ? "font-medium text-secondary" : "text-white/35"}`}
          >
            {summary}
          </span>
          <ChevronRight className="size-4 shrink-0 text-white/40 transition-transform group-data-[state=open]:translate-x-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={10}
        className={`${MENU_CONTENT_CLASS} max-h-[70vh] w-56 overflow-y-auto p-1.5`}
      >
        <DropdownMenuLabel className="flex items-center justify-between px-2 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
          {label}
          {max && !single && (
            <span className="normal-case tracking-normal">
              {selected.length}/{max}
            </span>
          )}
        </DropdownMenuLabel>
        {options.map((option) => {
          const active = selected.includes(option.id);
          return (
            <DropdownMenuItem
              key={option.id}
              disabled={!active && full}
              // Multi-select stays open so several can be picked in one go.
              onSelect={(e) => {
                if (!single) e.preventDefault();
                toggle(option.id);
              }}
              className={`gap-2 text-[13px] focus:bg-white/10 focus:text-white ${active ? "text-white" : "text-white/75"}`}
            >
              <span className="flex-1 truncate">{option.label}</span>
              {active && <Check className="text-secondary size-3.5" />}
            </DropdownMenuItem>
          );
        })}
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onSelect={() => onChange([])}
              className="justify-center text-xs text-white/50 focus:bg-white/10 focus:text-white"
            >
              Clear
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
