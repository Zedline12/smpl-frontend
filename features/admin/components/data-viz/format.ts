/** Number and date formatting shared by the admin dashboards. */

/** Money in minor units (cents) → "$1,234" / "$12.50" (compact: "$1.2K"). */
export const usd = (cents: number | null | undefined, compact = false) => usdDollars((cents ?? 0) / 100, compact);

/** Money already in dollars. */
export const usdDollars = (v: number | null | undefined, compact = false) => {
  const n = v ?? 0;
  if (compact && Math.abs(n) >= 1000)
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: Math.abs(n) >= 1000 ? 0 : 2 }).format(n);
};

export const int = (n: number | null | undefined) => new Intl.NumberFormat("en-US").format(Math.round(n ?? 0));

export const num = (n: number | null | undefined, digits = 2) =>
  n == null ? "—" : new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);

export const compactInt = (n: number | null | undefined) =>
  new Intl.NumberFormat("en-US", { notation: Math.abs(n ?? 0) >= 10_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n ?? 0);

export const pct = (r: number | null | undefined, digits = 1) => (r == null ? "—" : `${(r * 100).toFixed(digits)}%`);

/** "2h 05m", "3m 20s", "850 ms", "4d 2h". */
export const duration = (ms: number | null | undefined) => {
  if (ms == null) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, "0")}s`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ${String(m % 60).padStart(2, "0")}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
};

/** "2026-03" → "Mar" (or "Mar 26"). */
export const monthLabel = (key: string, withYear = false) => {
  const [y, m] = String(key).split("-").map(Number);
  if (!y || !m) return String(key);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    year: withYear ? "2-digit" : undefined,
    timeZone: "UTC",
  });
};

/** "2026-03-09" (or a full ISO date) → "Mar 9" (or "Mar 9, 2026"). */
export const dayLabel = (key: string, withYear = false) => {
  const d = new Date(String(key).length === 10 ? `${key}T00:00:00Z` : key);
  if (isNaN(d.getTime())) return String(key);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: withYear ? "numeric" : undefined, timeZone: "UTC" });
};

export const dateTimeLabel = (v: string) => {
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

export const humanize = (s: string) =>
  s === "unknown" ? "Not given" : s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
