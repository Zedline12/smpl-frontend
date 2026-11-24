"use client";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { GRID, OTHER, SERIES, SURFACE, axisProps } from "@/features/admin/components/data-viz/palette";
import { Legend, TooltipBox } from "@/features/admin/components/data-viz/parts";
import { DeltaText } from "@/features/admin/components/data-viz/kpi";
import { humanize } from "@/features/admin/components/data-viz/format";
import { formatAxis, formatValue, formatX } from "@/features/admin/brain/components/blocks/format";
import { offeringName } from "@/features/catalog/catalog";
import type { ValueFormat } from "@/features/admin/brain/types";
import type { BreakdownPayload, DashboardChart, KpiPayload, MetricPayload, SeriesPayload } from "./types";

const fmt = (f: string): ValueFormat => (f === "usd" ? "usd" : f === "pct" ? "pct" : f === "credits" ? "credits" : "int");

/** Model ids → catalog names; other keys → readable words. */
const breakdownLabel = (metric: string, label: string) =>
  metric.endsWith("by_model") ? offeringName(label, humanize(label)) : humanize(label);

/** One card's numbers drawn the way the admin picked. */
export function MetricChart({
  metric,
  payload,
  chart,
}: {
  metric: string;
  payload: MetricPayload;
  chart: DashboardChart;
}) {
  if (payload.kind === "kpi") return <KpiNumber payload={payload} />;
  if (payload.kind === "breakdown") return <Breakdown metric={metric} payload={payload} chart={chart} />;
  return <Series payload={payload} chart={chart} />;
}

function KpiNumber({ payload }: { payload: KpiPayload }) {
  const f = fmt(payload.format);
  return (
    <div className="flex h-full flex-col justify-end gap-2">
      <p className="truncate text-[32px] leading-none font-bold text-white tabular-nums">
        {payload.value === null ? "—" : formatValue(payload.value, f)}
      </p>
      <p className="min-h-4 text-[12px]">
        {payload.value !== null && (
          <DeltaText now={payload.value} before={payload.previous} goodWhenUp={!payload.invert} />
        )}
        {payload.hint && <span className="ml-1 text-white/35">{payload.hint}</span>}
      </p>
    </div>
  );
}

function Empty() {
  return <p className="py-10 text-center text-[12.5px] text-white/40">No data in this range.</p>;
}

function SimpleTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; format?: ValueFormat; x?: "date" | "month" | "text" }[];
  rows: Record<string, unknown>[];
}) {
  return (
    <div className="max-h-[260px] overflow-auto [scrollbar-width:thin]">
      <table className="w-full text-[12.5px]">
        <thead className="sticky top-0 bg-[#161616]">
          <tr className="text-left text-white/45">
            {columns.map((c, i) => (
              <th key={c.key} className={i ? "px-2 py-1.5 text-right font-medium" : "py-1.5 pr-2 font-medium"}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-t border-white/[0.05]">
              {columns.map((c, i) => (
                <td key={c.key} className={i ? "px-2 py-1.5 text-right text-white/80 tabular-nums" : "py-1.5 pr-2 text-white/70"}>
                  {c.x ? formatX(r[c.key], c.x) : formatValue(r[c.key], c.format)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Series({ payload, chart }: { payload: SeriesPayload; chart: DashboardChart }) {
  const f = fmt(payload.format);
  const series = useMemo(
    () => payload.series.slice(0, SERIES.length).map((s, i) => ({ ...s, color: SERIES[i] })),
    [payload.series],
  );
  const config = useMemo<ChartConfig>(
    () => Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }])),
    [series],
  );
  if (!payload.data.length || !series.length) return <Empty />;

  if (chart === "table")
    return (
      <SimpleTable
        columns={[
          { key: "period", label: "Period", x: payload.x },
          ...series.map((s) => ({ key: s.key, label: s.label, format: f })),
        ]}
        rows={[...payload.data].reverse()}
      />
    );

  const tooltip = (
    <ChartTooltip
      cursor={chart === "line" || chart === "area" ? { stroke: "rgba(255,255,255,0.2)" } : { fill: "rgba(255,255,255,0.04)" }}
      content={({ active, payload: p, label }) => {
        const row = p?.[0]?.payload as Record<string, unknown> | undefined;
        if (!row) return null;
        return (
          <TooltipBox
            active={active}
            label={formatX(label, payload.x)}
            rows={series.map((s) => ({ label: s.label, value: formatValue(row[s.key], f), color: s.color }))}
          />
        );
      }}
    />
  );
  const axes = (
    <>
      <CartesianGrid vertical={false} stroke={GRID} />
      <XAxis dataKey="period" tickFormatter={(v) => formatX(v, payload.x)} minTickGap={20} {...axisProps} />
      <YAxis width={52} tickFormatter={(v) => formatAxis(v, f)} {...axisProps} />
    </>
  );

  let body: React.ReactNode;
  if (chart === "line" || chart === "area") {
    const Chart = chart === "area" ? AreaChart : LineChart;
    body = (
      <Chart data={payload.data} margin={{ left: 0, right: 8, top: 4 }}>
        {axes}
        {tooltip}
        {series.map((s) =>
          chart === "area" ? (
            <Area key={s.key} dataKey={s.key} type="monotone" stroke={s.color} fill={s.color} fillOpacity={0.14} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: SURFACE, strokeWidth: 2 }} />
          ) : (
            <Line key={s.key} dataKey={s.key} type="monotone" stroke={s.color} strokeWidth={2} dot={payload.data.length <= 2} activeDot={{ r: 4, stroke: SURFACE, strokeWidth: 2 }} />
          ),
        )}
      </Chart>
    );
  } else {
    const stacked = chart === "stacked";
    body = (
      <BarChart data={payload.data} barCategoryGap={stacked ? "28%" : "20%"} margin={{ left: 0, right: 8, top: 4 }}>
        {axes}
        {tooltip}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            fill={s.color}
            stackId={stacked ? "s" : undefined}
            radius={!stacked || i === series.length - 1 ? [4, 4, 0, 0] : 0}
            stroke={SURFACE}
            strokeWidth={stacked ? 1 : 0}
            maxBarSize={44}
          />
        ))}
      </BarChart>
    );
  }

  return (
    <>
      {series.length > 1 && <Legend items={series.map((s) => ({ label: s.label, color: s.color, line: chart === "line" }))} />}
      <ChartContainer config={config} className="h-[220px] w-full aspect-auto">
        {body as React.ReactElement}
      </ChartContainer>
    </>
  );
}

function Breakdown({ metric, payload, chart }: { metric: string; payload: BreakdownPayload; chart: DashboardChart }) {
  const f = fmt(payload.format);
  const rows = useMemo(() => {
    const named = payload.data.map((d) => ({ ...d, label: breakdownLabel(metric, d.label) }));
    if (named.length <= SERIES.length) return named.map((d, i) => ({ ...d, color: SERIES[i] }));
    const keep = named.slice(0, SERIES.length - 1).map((d, i) => ({ ...d, color: SERIES[i] }));
    const rest = named.slice(SERIES.length - 1);
    return [
      ...keep,
      { key: "__other", label: `Other (${rest.length})`, value: rest.reduce((n, d) => n + d.value, 0), color: OTHER },
    ];
  }, [metric, payload.data]);
  const total = rows.reduce((n, r) => n + r.value, 0);
  if (!rows.length) return <Empty />;

  if (chart === "table")
    return (
      <SimpleTable
        columns={[
          { key: "label", label: "Name" },
          { key: "value", label: "Value", format: f },
        ]}
        rows={payload.data.map((d) => ({ label: breakdownLabel(metric, d.label), value: d.value }))}
      />
    );

  if (chart === "pie") {
    const config = Object.fromEntries(rows.map((r) => [r.key, { label: r.label, color: r.color }]));
    return (
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <ChartContainer config={config} className="aspect-square h-[180px] shrink-0">
          <PieChart>
            <ChartTooltip
              content={({ active, payload: p }) => {
                const r = p?.[0]?.payload as (typeof rows)[number] | undefined;
                if (!r) return null;
                return (
                  <TooltipBox
                    active={active}
                    label={r.label}
                    rows={[{ label: "Share", value: total ? `${((r.value / total) * 100).toFixed(1)}%` : "—" }, { label: "Value", value: formatValue(r.value, f) }]}
                  />
                );
              }}
            />
            <Pie data={rows} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="95%" stroke={SURFACE} strokeWidth={2}>
              {rows.map((r) => (
                <Cell key={r.key} fill={r.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="min-w-0 flex-1 space-y-1.5">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-3 text-[12.5px]">
              <span className="flex min-w-0 items-center gap-1.5 text-white/70">
                <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: r.color }} />
                <span className="truncate">{r.label}</span>
              </span>
              <span className="shrink-0 text-white/55 tabular-nums">
                {total ? `${((r.value / total) * 100).toFixed(0)}%` : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Bars: ranked, with values and shares.
  const max = Math.max(...payload.data.map((d) => d.value), 1);
  return (
    <div className="max-h-[260px] space-y-2.5 overflow-y-auto pr-1 [scrollbar-width:thin]">
      {payload.data.map((d) => (
        <div key={d.key}>
          <div className="mb-1 flex items-center justify-between gap-3 text-[12.5px]">
            <span className="truncate text-white/75">{breakdownLabel(metric, d.label)}</span>
            <span className="shrink-0 text-white/60 tabular-nums">
              {formatValue(d.value, f)}
              <span className="ml-2 text-white/35">{payload.total ? `${((d.value / payload.total) * 100).toFixed(0)}%` : ""}</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.05]">
            <div className="h-2 rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: SERIES[0] }} />
          </div>
        </div>
      ))}
    </div>
  );
}
