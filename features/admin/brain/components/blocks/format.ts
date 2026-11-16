import type { ValueFormat } from "../../types";
import {
  compactInt,
  dateTimeLabel,
  dayLabel,
  duration,
  int,
  monthLabel,
  num,
  pct,
  usd,
  usdDollars,
} from "@/features/admin/components/data-viz/format";

const NUMERIC: ValueFormat[] = ["int", "number", "usd_cents", "usd", "pct", "credits", "duration_ms"];
export const isNumericFormat = (f?: ValueFormat) => !!f && NUMERIC.includes(f);

/** One value as the admin should read it (cents → dollars, fractions → %, ms → "2m 05s"). */
export function formatValue(v: unknown, f?: ValueFormat): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "object") return JSON.stringify(v).slice(0, 120);
  const n = typeof v === "number" ? v : Number(v);
  switch (f) {
    case "int":
    case "credits":
      return Number.isFinite(n) ? int(n) : String(v);
    case "number":
      return Number.isFinite(n) ? num(n) : String(v);
    case "usd_cents":
      return Number.isFinite(n) ? usd(n) : String(v);
    case "usd":
      return Number.isFinite(n) ? usdDollars(n) : String(v);
    case "pct":
      return Number.isFinite(n) ? pct(n) : String(v);
    case "duration_ms":
      return Number.isFinite(n) ? duration(n) : String(v);
    case "date":
      return dayLabel(String(v), true);
    case "datetime":
      return dateTimeLabel(String(v));
    default:
      return typeof v === "number" ? num(v) : String(v);
  }
}

/** Short axis ticks: "$1.2K", "12%", "3.4K". */
export function formatAxis(v: unknown, f?: ValueFormat): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  switch (f) {
    case "usd_cents":
      return usd(n, true);
    case "usd":
      return usdDollars(n, true);
    case "pct":
      return pct(n, 0);
    case "duration_ms":
      return duration(n);
    default:
      return compactInt(n);
  }
}

export function formatX(v: unknown, x?: "date" | "month" | "hour" | "text"): string {
  const s = String(v ?? "");
  if (x === "month") return monthLabel(s, true);
  if (x === "date") return dayLabel(s);
  if (x === "hour") {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleTimeString("en-US", { hour: "numeric" });
  }
  return s;
}

/** Fills a link pattern like /admin/users/{id}; null when a field is missing or it's not an admin page. */
export function fillLink(pattern: string | undefined, row: Record<string, unknown>): string | null {
  if (!pattern || !pattern.startsWith("/admin")) return null;
  let missing = false;
  const href = pattern.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = row[key];
    if (v === null || v === undefined || v === "") {
      missing = true;
      return "";
    }
    return encodeURIComponent(String(v));
  });
  return missing ? null : href;
}

/** CSV with raw values (cents stay cents; the header says so). */
export function toCsv(columns: { key: string; label: string; format?: ValueFormat }[], rows: Record<string, unknown>[]) {
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => esc(c.format === "usd_cents" ? `${c.label} (cents)` : c.format === "duration_ms" ? `${c.label} (ms)` : c.label));
  return [header.join(","), ...rows.map((r) => columns.map((c) => esc(r[c.key])).join(","))].join("\n");
}

export function downloadText(filename: string, text: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "brain";
