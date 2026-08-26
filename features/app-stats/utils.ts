const COMPACT_THRESHOLD = 10_000;

/**
 * Exact with separators below 10k, abbreviated above it.
 *
 * The locale is pinned: a bare `toLocaleString()` uses the runtime's locale,
 * which differs between the server and the visitor's browser and would cause a
 * hydration mismatch on server-rendered numbers.
 */
export function formatStatValue(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;

  if (safe < COMPACT_THRESHOLD) return safe.toLocaleString("en-US");

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(safe);
}
