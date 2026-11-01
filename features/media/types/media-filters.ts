import { AiModelsEnum } from "@/features/generation/enums/models.enum";

export type DateRangePreset = "any" | "24h" | "7d" | "30d" | "90d" | "custom";

export interface DateRange {
  preset: DateRangePreset;
  /** yyyy-mm-dd, only used by the "custom" preset */
  from?: string;
  /** yyyy-mm-dd, only used by the "custom" preset */
  to?: string;
}

export interface MediaFilters {
  /** Undefined means all models. */
  model?: AiModelsEnum;
  dateRange: DateRange;
  liked: boolean;
  downloaded: boolean;
}

export const DATE_RANGE_PRESETS: { value: Exclude<DateRangePreset, "custom">; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const PRESET_HOURS: Record<Exclude<DateRangePreset, "any" | "custom">, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
  "90d": 24 * 90,
};

export function createMediaFilters(model?: AiModelsEnum): MediaFilters {
  return { model, dateRange: { preset: "any" }, liked: false, downloaded: false };
}

/** Turns a date range into ISO bounds for the API; both are undefined for "any time". */
export function resolveDateRange(range: DateRange): { from?: string; to?: string } {
  if (range.preset === "any") return {};
  if (range.preset === "custom") {
    return {
      from: range.from ? new Date(`${range.from}T00:00:00`).toISOString() : undefined,
      to: range.to ? new Date(`${range.to}T23:59:59.999`).toISOString() : undefined,
    };
  }
  return { from: new Date(Date.now() - PRESET_HOURS[range.preset] * 3_600_000).toISOString() };
}

export function countActiveFilters(filters: MediaFilters, defaultModel?: AiModelsEnum): number {
  return (
    Number(filters.model !== defaultModel) +
    Number(filters.dateRange.preset !== "any") +
    Number(filters.liked) +
    Number(filters.downloaded)
  );
}
