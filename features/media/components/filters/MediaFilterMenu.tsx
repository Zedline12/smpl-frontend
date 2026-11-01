"use client";
import { ReactNode, useMemo } from "react";
import { CalendarDays, Check, Download, Heart, ListFilter, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AiModelsEnum, getModel, isAiModel } from "@/features/generation/enums/models.enum";
import { useUserModelsQuery } from "@/features/generation/hooks/generation";
import {
  countActiveFilters,
  createMediaFilters,
  DATE_RANGE_PRESETS,
  DateRange,
  MediaFilters,
} from "../../types/media-filters";
import { MENU_CONTENT_CLASS } from "../actions/MediaCardActions";

interface MediaFilterMenuProps {
  value: MediaFilters;
  onChange: (next: MediaFilters) => void;
  /** The model the explorer starts on; "Clear" goes back to it. */
  defaultModel?: AiModelsEnum;
}

const SECTION_LABEL = "px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40";
const ITEM = "gap-2.5 text-[13px] text-white/80 focus:bg-white/10 focus:text-white";

export function MediaFilterMenu({ value, onChange, defaultModel }: MediaFilterMenuProps) {
  const { data: usedModels = [] } = useUserModelsQuery();

  const modelOptions = useMemo(() => {
    const ids = new Set(usedModels.filter(isAiModel));
    if (defaultModel) ids.add(defaultModel);
    if (value.model) ids.add(value.model);
    return [...ids]
      .map((id) => ({ id, name: getModel(id)?.name ?? id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [usedModels, defaultModel, value.model]);

  const activeCount = countActiveFilters(value, defaultModel);
  const modelLabel = value.model ? (getModel(value.model)?.name ?? value.model) : "All Models";
  const dateLabel = describeDateRange(value.dateRange);

  const set = (patch: Partial<MediaFilters>) => onChange({ ...value, ...patch });
  const setDateRange = (dateRange: DateRange) => set({ dateRange });
  // Keeps the menu open so several filters can be toggled in one go.
  const keepOpen = (e: Event) => e.preventDefault();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Filter media"
          title="Filter"
          className="relative flex size-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white"
        >
          <ListFilter className="size-4" />
          {activeCount > 0 && (
            <span className="bg-primary absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={6} className={`${MENU_CONTENT_CLASS} w-60 p-1.5`}>
        <DropdownMenuLabel className={SECTION_LABEL}>Type</DropdownMenuLabel>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={ITEM}>
            <Star />
            <SubTriggerText label={modelLabel} />
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent sideOffset={6} className={`${MENU_CONTENT_CLASS} max-h-80 w-56 overflow-y-auto p-1.5`}>
              <OptionItem selected={!value.model} onSelect={() => set({ model: undefined })}>
                All Models
              </OptionItem>
              {modelOptions.length > 0 && <DropdownMenuSeparator className="bg-white/10" />}
              {modelOptions.map((m) => (
                <OptionItem key={m.id} selected={value.model === m.id} onSelect={() => set({ model: m.id })}>
                  {m.name}
                </OptionItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={ITEM}>
            <CalendarDays />
            <SubTriggerText label={dateLabel} />
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent sideOffset={6} className={`${MENU_CONTENT_CLASS} w-56 p-1.5`}>
              {DATE_RANGE_PRESETS.map((p) => (
                <OptionItem
                  key={p.value}
                  selected={value.dateRange.preset === p.value}
                  onSelect={() => setDateRange({ preset: p.value })}
                >
                  {p.label}
                </OptionItem>
              ))}
              <DropdownMenuSeparator className="bg-white/10" />
              <CustomDateRange range={value.dateRange} onChange={setDateRange} />
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuLabel className={SECTION_LABEL}>Activity</DropdownMenuLabel>

        <DropdownMenuItem
          className={ITEM}
          onSelect={(e) => {
            keepOpen(e);
            set({ liked: !value.liked });
          }}
        >
          <Heart className={value.liked ? "fill-red-500 text-red-500" : undefined} />
          <span className="flex-1">Liked</span>
          {value.liked && <Check className="size-3.5 text-white" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={ITEM}
          onSelect={(e) => {
            keepOpen(e);
            set({ downloaded: !value.downloaded });
          }}
        >
          <Download />
          <span className="flex-1">Downloaded</span>
          {value.downloaded && <Check className="size-3.5 text-white" />}
        </DropdownMenuItem>

        {activeCount > 0 && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              className="justify-center text-xs text-white/50 focus:bg-white/10 focus:text-white"
              onSelect={() => onChange(createMediaFilters(defaultModel))}
            >
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SubTriggerText({ label }: { label: string }) {
  return <span className="flex-1 truncate">{label}</span>;
}

function OptionItem({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <DropdownMenuItem
      className={`${ITEM} ${selected ? "text-white" : ""}`}
      onSelect={(e) => {
        e.preventDefault();
        onSelect();
      }}
    >
      <span className="flex-1 truncate">{children}</span>
      {selected && <Check className="size-3.5 text-white" />}
    </DropdownMenuItem>
  );
}

function CustomDateRange({
  range,
  onChange,
}: {
  range: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const from = range.preset === "custom" ? range.from ?? "" : "";
  const to = range.preset === "custom" ? range.to ?? "" : "";
  const update = (patch: { from?: string; to?: string }) => {
    const next = { from, to, ...patch };
    onChange(next.from || next.to ? { preset: "custom", ...next } : { preset: "any" });
  };

  return (
    // Menu typeahead would swallow keystrokes meant for the date inputs.
    <div className="flex flex-col gap-2 px-2 py-1.5" onKeyDown={(e) => e.stopPropagation()}>
      <span className="text-[11px] text-white/40">Custom range</span>
      <DateField label="From" value={from} max={to || undefined} onChange={(v) => update({ from: v })} />
      <DateField label="To" value={to} min={from || undefined} onChange={(v) => update({ to: v })} />
    </div>
  );
}

function DateField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-white/60">
      <span className="w-9">{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white [color-scheme:dark] focus:border-white/30 focus:outline-none"
      />
    </label>
  );
}

function describeDateRange(range: DateRange): string {
  if (range.preset === "custom") {
    if (range.from && range.to) return `${range.from} → ${range.to}`;
    if (range.from) return `From ${range.from}`;
    if (range.to) return `Until ${range.to}`;
  }
  if (range.preset === "any" || range.preset === "custom") return "Date Range";
  return DATE_RANGE_PRESETS.find((p) => p.value === range.preset)?.label ?? "Date Range";
}
