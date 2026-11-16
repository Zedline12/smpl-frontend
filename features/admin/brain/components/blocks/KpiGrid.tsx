import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpisBlock } from "../../types";
import { formatValue } from "./format";

/** A row of KPI tiles: value, optional change vs before (green when good), and a hint. */
// Columns that leave no lonely last tile: 3 → 3, 5/6/9 → 3, 7/8/10+ → 4.
const COLS: Record<number, string> = {
  1: "grid-cols-1 sm:grid-cols-2",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

export function KpiGrid({ block }: { block: KpisBlock }) {
  const n = block.items.length;
  const cols =
    COLS[n] ??
    (n === 5
      ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
      : n % 3 === 0
        ? COLS[3]
        : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4");
  return (
    <div className="min-w-0">
      {block.title && <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-white/40">{block.title}</p>}
      <div className={cn("grid gap-2.5", cols)}>
        {block.items.map((item) => {
          const up = (item.delta ?? 0) > 0;
          const good = item.invert ? !up : up;
          return (
            <div key={item.label} className="min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
              <p className="truncate text-[12px] font-medium text-white/50" title={item.label}>
                {item.label}
              </p>
              <p
                className={cn(
                  "mt-1.5 truncate font-bold leading-tight tabular-nums text-white",
                  item.format === "text" ? "text-[17px]" : "text-[22px]",
                )}
                title={formatValue(item.value, item.format)}
              >
                {formatValue(item.value, item.format)}
              </p>
              {(item.delta != null || item.hint) && (
                <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[11.5px] leading-snug text-white/40">
                  {item.delta != null && item.delta !== 0 && (
                    <span className={cn("inline-flex items-center font-semibold", good ? "text-emerald-400" : "text-red-400")}>
                      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {Math.abs(item.delta * 100).toFixed(Math.abs(item.delta) < 0.1 ? 1 : 0)}%
                    </span>
                  )}
                  {item.delta === 0 && <span>No change</span>}
                  {item.hint && <span className="min-w-0 truncate" title={item.hint}>{item.hint}</span>}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
