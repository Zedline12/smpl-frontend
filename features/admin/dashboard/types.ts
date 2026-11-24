/** Mirrors smpl-backend/src/modules/admin/dashboard (catalog, layout, metric payloads). */

export type DashboardChart = "number" | "line" | "area" | "bar" | "stacked" | "pie" | "table";
export type DashboardRange = "7d" | "30d" | "90d" | "12m" | "all";
export type DashboardSize = "sm" | "md" | "lg" | "full";
export type MetricFormat = "int" | "usd" | "pct" | "credits";
export type MetricCategory = "Users" | "Generations" | "Credits" | "Revenue" | "Support" | "Gifts";

export interface MetricDef {
  id: string;
  title: string;
  description: string;
  category: MetricCategory;
  kind: "series" | "breakdown" | "kpi";
  charts: DashboardChart[];
  defaultChart: DashboardChart;
}

export interface DashboardCatalog {
  metrics: MetricDef[];
  ranges: DashboardRange[];
  sizes: DashboardSize[];
  maxCards: number;
}

export interface DashboardCard {
  id: string;
  metric: string;
  chart: DashboardChart;
  range: DashboardRange;
  size: DashboardSize;
}

export interface DashboardLayout {
  cards: DashboardCard[];
  isDefault: boolean;
}

export interface SeriesPayload {
  kind: "series";
  x: "date" | "month";
  series: { key: string; label: string }[];
  data: Record<string, number | string>[];
  format: MetricFormat;
  total?: number | null;
}
export interface BreakdownPayload {
  kind: "breakdown";
  data: { key: string; label: string; value: number }[];
  format: MetricFormat;
  total?: number | null;
}
export interface KpiPayload {
  kind: "kpi";
  value: number | null;
  previous: number | null;
  format: MetricFormat;
  invert?: boolean;
  hint?: string;
}
export type MetricPayload = SeriesPayload | BreakdownPayload | KpiPayload;

export const RANGE_LABELS: Record<DashboardRange, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  "12m": "12 months",
  all: "All time",
};

export const SIZE_LABELS: Record<DashboardSize, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
  full: "Full width",
};

export const CHART_LABELS: Record<DashboardChart, string> = {
  number: "Number",
  line: "Line",
  area: "Area",
  bar: "Bars",
  stacked: "Stacked bars",
  pie: "Pie",
  table: "Table",
};

/** Grid columns per size (1 / 2 / 4 columns as the screen grows). */
export const SIZE_CLASS: Record<DashboardSize, string> = {
  sm: "col-span-1",
  md: "col-span-1 md:col-span-2",
  lg: "col-span-1 md:col-span-2 xl:col-span-3",
  full: "col-span-1 md:col-span-2 xl:col-span-4",
};
