interface UsageItem {
  count: number;
  model: string;
  usage: number;
}

export interface CreditsUsageData {
  availableCredits: number;
  usagePercentage: number;
  usageList: UsageItem[];
}

function formatModelName(model: string) {
  return model
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function CreditsUsageCard({ data }: { data: CreditsUsageData }) {
  const { availableCredits, usagePercentage, usageList } = data;
  const clampedPct = Math.min(100, Math.max(0, usagePercentage));

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "oklch(0.13 0 0)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      {/* Available credits */}
      <div
        className="px-6 py-5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Available
        </p>
        <p
          className="text-4xl font-bold tracking-tight"
          style={{
            fontFamily: "var(--font-display)",
            background: "linear-gradient(135deg, #6b41ff, #ea4bff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {availableCredits.toLocaleString()}
        </p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          credits remaining
        </p>
      </div>

      {/* Usage bar */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
            Usage this month
          </p>
          <p
            className="text-xs font-semibold"
            style={{
              color:
                clampedPct >= 90
                  ? "#ef4444"
                  : clampedPct >= 70
                  ? "#f59e0b"
                  : "rgba(255,255,255,0.7)",
            }}
          >
            {clampedPct}%
          </p>
        </div>

        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${clampedPct}%`,
              background:
                clampedPct >= 90
                  ? "linear-gradient(90deg, #ef4444, #f97316)"
                  : "linear-gradient(90deg, #6b41ff, #ea4bff)",
            }}
          />
        </div>

        {usageList.length > 0 && (
          <div
            className="mt-5 flex flex-col gap-0 divide-y"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            {usageList.map((item) => (
              <div
                key={item.model}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #6b41ff, #ea4bff)" }}
                  />
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {formatModelName(item.model)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {item.count} {item.count === 1 ? "run" : "runs"}
                  </span>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{
                      color:
                        item.usage > 0
                          ? "rgba(255,255,255,0.85)"
                          : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {item.usage.toLocaleString()} cr
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
