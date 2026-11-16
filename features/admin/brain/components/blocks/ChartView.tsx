"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { GRID, OTHER, SERIES, SURFACE, axisProps } from "@/features/admin/components/data-viz/palette";
import { ChartCard, Legend, TooltipBox } from "@/features/admin/components/data-viz/parts";
import type { ChartBlock, TableBlock } from "../../types";
import { DataTable } from "./DataTable";
import { formatAxis, formatValue, formatX } from "./format";

const MAX_COLORED = 5;

/** At most five colored series (fixed order); the rest fold into "Other". */
function fold(block: ChartBlock) {
  const series = block.series.filter((s) => block.data.some((d) => typeof d[s.key] === "number"));
  if (series.length <= MAX_COLORED) {
    return { series: series.map((s, i) => ({ ...s, color: SERIES[i] })), data: block.data };
  }
  const keep = series.slice(0, MAX_COLORED - 1);
  const rest = series.slice(MAX_COLORED - 1);
  const data = block.data.map((d) => ({
    ...d,
    __other: rest.reduce((n, s) => n + (typeof d[s.key] === "number" ? (d[s.key] as number) : 0), 0),
  }));
  return {
    series: [...keep.map((s, i) => ({ ...s, color: SERIES[i] })), { key: "__other", label: `Other (${rest.length})`, color: OTHER }],
    data,
  };
}

/** Part-to-whole as ranked bars with shares (reads better than a pie). */
function ShareBars({ block }: { block: ChartBlock }) {
  const key = block.series[0]?.key;
  const rows = block.data
    .map((d) => ({ label: String(d[block.x] ?? "—"), value: Number(d[key]) || 0 }))
    .sort((a, b) => b.value - a.value);
  const total = rows.reduce((n, r) => n + r.value, 0);
  const max = rows[0]?.value || 1;
  return (
    <div className="space-y-2.5">
      {rows.slice(0, 12).map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-[12.5px]">
            <span className="truncate text-white/75">{formatX(r.label, block.xFormat)}</span>
            <span className="shrink-0 tabular-nums text-white/60">
              {formatValue(r.value, block.format)}
              <span className="ml-2 text-white/35">{total ? `${((r.value / total) * 100).toFixed(0)}%` : ""}</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.05]">
            <div className="h-2 rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: SERIES[0] }} />
          </div>
        </div>
      ))}
      {rows.length > 12 && <p className="text-[11.5px] text-white/35">+{rows.length - 12} more (see the table view)</p>}
    </div>
  );
}

export function ChartView({ block }: { block: ChartBlock }) {
  const [asTable, setAsTable] = useState(false);
  const { series, data } = useMemo(() => fold(block), [block]);
  const config = useMemo<ChartConfig>(() => Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }])), [series]);

  const table: TableBlock = useMemo(
    () => ({
      type: "table",
      title: block.title,
      columns: [
        { key: block.x, label: block.x === "period" ? "Period" : block.x.replace(/^\w/, (c) => c.toUpperCase()), format: block.xFormat === "date" ? "date" : "text" },
        ...block.series.map((s) => ({ key: s.key, label: s.label, format: block.format })),
      ],
      rows: block.data,
    }),
    [block],
  );

  const toggle = (
    <button
      type="button"
      onClick={() => setAsTable((v) => !v)}
      className="shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11.5px] font-medium text-white/55 hover:text-white"
    >
      {asTable ? "Chart" : "Table"}
    </button>
  );

  if (!data.length || !series.length) {
    return (
      <ChartCard title={block.title} subtitle={block.subtitle}>
        <p className="text-[12.5px] text-white/40">No data in this range.</p>
      </ChartCard>
    );
  }

  const categorical = !block.xFormat || block.xFormat === "text";
  const longLabels = categorical && data.some((d) => String(d[block.x] ?? "").length > 12);
  const horizontal = block.kind === "bar" && categorical && (data.length > 8 || longLabels);
  const hasNegative = data.some((d) => series.some((s) => typeof d[s.key] === "number" && (d[s.key] as number) < 0));

  const tooltip = (
    <ChartTooltip
      cursor={block.kind === "line" || block.kind === "area" ? { stroke: "rgba(255,255,255,0.2)" } : { fill: "rgba(255,255,255,0.04)" }}
      content={({ active, payload, label }) => {
        const row = payload?.[0]?.payload as Record<string, unknown> | undefined;
        if (!row) return null;
        return (
          <TooltipBox
            active={active}
            label={formatX(horizontal ? row[block.x] : label, block.xFormat)}
            rows={series.map((s) => ({ label: s.label, value: formatValue(row[s.key], block.format), color: s.color }))}
          />
        );
      }}
    />
  );

  let chart: React.ReactNode;
  if (block.kind === "pie") {
    chart = <ShareBars block={block} />;
  } else if (horizontal) {
    const rows = data.slice(0, 25);
    chart = (
      <ChartContainer config={config} className="w-full aspect-auto" style={{ height: Math.min(560, 40 + rows.length * 30) }}>
        <BarChart data={rows} layout="vertical" barCategoryGap="22%" margin={{ left: 4, right: 12 }}>
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" tickFormatter={(v) => formatAxis(v, block.format)} {...axisProps} />
          <YAxis type="category" dataKey={block.x} width={130} tickFormatter={(v) => String(v).slice(0, 20)} {...axisProps} />
          {tooltip}
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              fill={s.color}
              stackId={series.length > 1 && block.kind !== "bar" ? "s" : undefined}
              radius={i === series.length - 1 || series.length === 1 ? [0, 4, 4, 0] : 0}
              stroke={SURFACE}
              strokeWidth={series.length > 1 ? 1 : 0}
            />
          ))}
        </BarChart>
      </ChartContainer>
    );
  } else if (block.kind === "line" || block.kind === "area") {
    const Chart = block.kind === "area" ? AreaChart : LineChart;
    chart = (
      <ChartContainer config={config} className="h-[240px] w-full aspect-auto">
        <Chart data={data} margin={{ left: 0, right: 8, top: 4 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey={block.x} tickFormatter={(v) => formatX(v, block.xFormat)} minTickGap={24} {...axisProps} />
          <YAxis width={52} tickFormatter={(v) => formatAxis(v, block.format)} {...axisProps} />
          {hasNegative && <ReferenceLine y={0} stroke="#383835" />}
          {tooltip}
          {series.map((s) =>
            block.kind === "area" ? (
              <Area key={s.key} dataKey={s.key} type="monotone" stroke={s.color} fill={s.color} fillOpacity={0.14} strokeWidth={2} stackId={series.length > 1 ? "s" : undefined} dot={false} activeDot={{ r: 4, stroke: SURFACE, strokeWidth: 2 }} />
            ) : (
              <Line key={s.key} dataKey={s.key} type="monotone" stroke={s.color} strokeWidth={2} dot={data.length <= 2} activeDot={{ r: 4, stroke: SURFACE, strokeWidth: 2 }} />
            ),
          )}
        </Chart>
      </ChartContainer>
    );
  } else {
    const stacked = block.kind === "stacked";
    chart = (
      <ChartContainer config={config} className="h-[250px] w-full aspect-auto">
        <BarChart data={data} stackOffset={hasNegative && stacked ? "sign" : undefined} barCategoryGap={stacked ? "28%" : "20%"} margin={{ left: 0, right: 8, top: 4 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey={block.x} tickFormatter={(v) => formatX(v, block.xFormat)} minTickGap={12} interval="preserveStartEnd" {...axisProps} />
          <YAxis width={52} tickFormatter={(v) => formatAxis(v, block.format)} {...axisProps} />
          {hasNegative && <ReferenceLine y={0} stroke="#383835" />}
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
              maxBarSize={48}
            />
          ))}
        </BarChart>
      </ChartContainer>
    );
  }

  return (
    <ChartCard title={block.title} subtitle={block.subtitle} action={toggle}>
      {asTable ? (
        <DataTable block={table} bare />
      ) : (
        <>
          {series.length > 1 && block.kind !== "pie" && <Legend items={series.map((s) => ({ label: s.label, color: s.color, line: block.kind === "line" }))} />}
          {chart}
        </>
      )}
    </ChartCard>
  );
}
