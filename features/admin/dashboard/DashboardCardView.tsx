"use client";
import { ArrowLeft, ArrowRight, GripVertical, RefreshCw, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { cardClass } from "@/features/admin/components/data-viz/palette";
import { formatValue } from "@/features/admin/brain/components/blocks/format";
import { fetchMetric, metricKey, useMetric } from "./api";
import dynamic from "next/dynamic";

// The chart library is big; load it with the first card instead of with the page.
const MetricChart = dynamic(() => import("./MetricChart").then((m) => m.MetricChart), {
  ssr: false,
  loading: () => <div className="h-full min-h-32 w-full animate-pulse rounded-lg bg-white/[0.04]" />,
});
import {
  CHART_LABELS,
  RANGE_LABELS,
  SIZE_CLASS,
  SIZE_LABELS,
  type DashboardCard,
  type DashboardRange,
  type DashboardSize,
  type MetricDef,
} from "./types";

const RANGES = Object.keys(RANGE_LABELS) as DashboardRange[];
const SIZES = Object.keys(SIZE_LABELS) as DashboardSize[];

const selectClass =
  "h-7 rounded-md border border-white/10 bg-black/40 px-1.5 text-[11.5px] text-white/80 focus:outline-none";

/** One card on the board: its numbers, and in edit mode its chart, range, size, order and remove. */
export function DashboardCardView({
  card,
  def,
  editing,
  index,
  count,
  onChange,
  onMove,
  onRemove,
  drag,
}: {
  card: DashboardCard;
  def: MetricDef | undefined;
  editing: boolean;
  index: number;
  count: number;
  onChange: (patch: Partial<DashboardCard>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  /** Native drag-and-drop handlers (edit mode). */
  drag: {
    dragging: boolean;
    over: boolean;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
    onDragEnd: () => void;
  };
}) {
  const qc = useQueryClient();
  const metric = useMetric(card.metric, card.range);
  const payload = metric.data;
  const kpi = def?.kind === "kpi";

  const refresh = async () => {
    try {
      qc.setQueryData(metricKey(card.metric, card.range), await fetchMetric(card.metric, card.range, true));
    } catch {
      void metric.refetch();
    }
  };

  const total =
    payload && payload.kind !== "kpi" && payload.total !== null && payload.total !== undefined
      ? formatValue(payload.total, payload.format === "usd" ? "usd" : payload.format === "pct" ? "pct" : payload.format === "credits" ? "credits" : "int")
      : null;

  return (
    <div
      draggable={editing}
      onDragStart={editing ? drag.onDragStart : undefined}
      onDragOver={editing ? drag.onDragOver : undefined}
      onDrop={editing ? drag.onDrop : undefined}
      onDragEnd={editing ? drag.onDragEnd : undefined}
      className={cn(
        cardClass,
        "flex min-w-0 flex-col p-5 transition-all",
        SIZE_CLASS[card.size],
        kpi && "min-h-[150px]",
        editing && "cursor-grab border-dashed border-white/20 active:cursor-grabbing",
        drag.dragging && "opacity-40",
        drag.over && "ring-primary ring-2",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-[14px] font-semibold text-white">
            {editing && <GripVertical className="size-4 shrink-0 text-white/30" />}
            {def?.title ?? card.metric}
          </p>
          <p className="mt-0.5 truncate text-[11.5px] text-white/40">
            {RANGE_LABELS[card.range]}
            {total && (
              <>
                {" · "}
                <span className="text-white/65">{total}</span>
              </>
            )}
          </p>
        </div>
        {editing ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove card"
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-white/45 hover:bg-red-500/15 hover:text-red-300"
          >
            <X className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh"
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-white/30 hover:text-white"
          >
            <RefreshCw className={cn("size-3.5", metric.isFetching && "animate-spin")} />
          </button>
        )}
      </div>

      {editing && def && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {def.charts.length > 1 && (
            <select
              aria-label="Chart type"
              value={card.chart}
              onChange={(e) => onChange({ chart: e.target.value as DashboardCard["chart"] })}
              className={selectClass}
            >
              {def.charts.map((c) => (
                <option key={c} value={c}>
                  {CHART_LABELS[c]}
                </option>
              ))}
            </select>
          )}
          <select
            aria-label="Range"
            value={card.range}
            onChange={(e) => onChange({ range: e.target.value as DashboardRange })}
            className={selectClass}
          >
            {RANGES.map((r) => (
              <option key={r} value={r}>
                {RANGE_LABELS[r]}
              </option>
            ))}
          </select>
          <select
            aria-label="Size"
            value={card.size}
            onChange={(e) => onChange({ size: e.target.value as DashboardSize })}
            className={selectClass}
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {SIZE_LABELS[s]}
              </option>
            ))}
          </select>
          <span className="ml-auto flex gap-1">
            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={index === 0}
              aria-label="Move earlier"
              className="flex size-7 items-center justify-center rounded-md border border-white/10 text-white/60 hover:text-white disabled:opacity-30"
            >
              <ArrowLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={index === count - 1}
              aria-label="Move later"
              className="flex size-7 items-center justify-center rounded-md border border-white/10 text-white/60 hover:text-white disabled:opacity-30"
            >
              <ArrowRight className="size-3.5" />
            </button>
          </span>
        </div>
      )}

      <div className={cn("mt-4 min-h-0 flex-1", editing && "pointer-events-none select-none")}>
        {metric.isLoading ? (
          <div className={cn("animate-pulse rounded-xl bg-white/[0.04]", kpi ? "h-14" : "h-[200px]")} />
        ) : metric.isError ? (
          <div className="flex flex-col items-start gap-2 py-4">
            <p className="text-[12.5px] text-red-300">{(metric.error as Error).message}</p>
            <button type="button" onClick={() => metric.refetch()} className="text-[12px] text-white/60 underline hover:text-white">
              Try again
            </button>
          </div>
        ) : payload ? (
          <MetricChart metric={card.metric} payload={payload} chart={card.chart} />
        ) : null}
      </div>
    </div>
  );
}
