"use client";

import { useState } from "react";
import { ChevronDown, CircleDollarSign, Coins, Percent, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { KpiTile, DeltaText } from "@/features/admin/components/data-viz/kpi";
import { ChartCard, Legend, TooltipBox } from "@/features/admin/components/data-viz/parts";
import { GRID, SERIES, axisProps } from "@/features/admin/components/data-viz/palette";
import { int, pct, usdDollars } from "@/features/admin/components/data-viz/format";

interface ModelGeneration {
  totalGenerations: number;
  totalCost: number;
}
interface RevenueBySource {
  newMonthly: number;
  newYearly: number;
  renewalsMonthly: number;
  renewalsYearly: number;
  planChanges: number;
  creditPacks: number;
  refunds: number;
  gross: number;
}
interface MonthData {
  grossVolume: number;
  netVolume: number;
  netProfit: number;
  totalGenerationsCost: number;
  totalGenerations: number;
  disputes: number;
  refunds: number;
  stripeFees: number;
  transfers: number;
  generations: Record<string, ModelGeneration>;
  yearMonth?: string;
  revenueBySource?: RevenueBySource;
  grossMargin?: number | null;
  costPerGeneration?: number;
}

/** The revenue sources, in display order (colors from the shared palette). */
const SOURCES: { key: keyof RevenueBySource; label: string; color: string }[] = [
  { key: "newMonthly", label: "New · monthly", color: SERIES[0] },
  { key: "newYearly", label: "New · annual", color: "#86b6ef" },
  { key: "renewalsMonthly", label: "Renewals · monthly", color: SERIES[2] },
  { key: "renewalsYearly", label: "Renewals · annual", color: "#5fd0a8" },
  { key: "planChanges", label: "Plan changes", color: SERIES[3] },
  { key: "creditPacks", label: "Credit packs", color: SERIES[4] },
];

const money = (n: number | undefined) => usdDollars(n ?? 0);

/** Profit: revenue by source (new vs renewals, monthly vs annual, packs), costs and profit over time. */
export function ProfitDashboard({ months }: { months: Record<string, MonthData> }) {
  const monthKeys = Object.keys(months);
  const [selected, setSelected] = useState(monthKeys[0] ?? "");
  const data = months[selected];
  const prevKey = monthKeys[monthKeys.indexOf(selected) + 1];
  const prev = prevKey ? months[prevKey] : undefined;

  // Oldest → newest for the trend charts.
  const timeline = [...monthKeys].reverse().map((k) => ({
    month: k,
    revenue: months[k].netVolume,
    cost: months[k].totalGenerationsCost,
    profit: months[k].netProfit,
    generations: months[k].totalGenerations,
    ...Object.fromEntries(SOURCES.map((s) => [s.key, months[k].revenueBySource?.[s.key] ?? 0])),
  }));

  const sources = data?.revenueBySource;
  const sourceTotal = sources ? SOURCES.reduce((n, s) => n + (sources[s.key] ?? 0), 0) : 0;
  const modelRows = data
    ? Object.entries(data.generations)
        .map(([model, v]) => ({ model, ...v }))
        .sort((a, b) => b.totalCost - a.totalCost)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Profit</h2>
          <p className="mt-1 text-sm text-white/45">Where revenue comes from, what generations cost, and what is left.</p>
        </div>
        <div className="relative">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="h-10 w-48 cursor-pointer appearance-none rounded-xl border border-neutral-700 bg-neutral-900 pr-9 pl-4 text-sm font-medium text-white focus:outline-none"
          >
            {monthKeys.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>

      {!data ? (
        <p className="text-neutral-500">No data available.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiTile label="Net revenue (after Stripe)" value={money(data.netVolume)} accent="emerald" icon={CircleDollarSign}>
              <DeltaText now={data.netVolume} before={prev?.netVolume} /> · gross {money(data.grossVolume)}
            </KpiTile>
            <KpiTile label="Generation cost" value={money(data.totalGenerationsCost)} accent="orange" icon={Coins}>
              <DeltaText now={data.totalGenerationsCost} before={prev?.totalGenerationsCost} goodWhenUp={false} /> · {int(data.totalGenerations)} generations
            </KpiTile>
            <KpiTile label="Net profit" value={money(data.netProfit)} accent="violet" icon={TrendingUp}>
              <DeltaText now={data.netProfit} before={prev?.netProfit} />
            </KpiTile>
            <KpiTile label="Margin" value={pct(data.grossMargin ?? null)} accent="blue" icon={Percent}>
              {usdDollars(data.costPerGeneration ?? 0)} cost per generation
            </KpiTile>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Stripe fees", data.stripeFees],
              ["Refunds", data.refunds],
              ["Disputes", data.disputes],
              ["Transfers", data.transfers],
            ].map(([label, value]) => (
              <div key={label as string} className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-3">
                <span className="text-[11px] font-medium tracking-wider text-neutral-500 uppercase">{label}</span>
                <span className="text-base font-semibold text-neutral-200">{money(value as number)}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <ChartCard title="Where the money came from" subtitle={`${selected} · paid invoices, before refunds`}>
              {sources && sourceTotal > 0 ? (
                <div className="flex flex-col gap-3">
                  {SOURCES.map((s) => {
                    const v = sources[s.key] ?? 0;
                    const share = sourceTotal ? v / sourceTotal : 0;
                    return (
                      <div key={s.key}>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="flex items-center gap-2 text-white/75">
                            <span className="inline-block size-2.5 rounded-[3px]" style={{ background: s.color }} />
                            {s.label}
                          </span>
                          <span className="text-white tabular-nums">
                            {money(v)} <span className="text-white/40">· {pct(share, 0)}</span>
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div className="h-full rounded-full" style={{ width: `${share * 100}%`, background: s.color }} />
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-1 flex justify-between border-t border-white/10 pt-2 text-[13px]">
                    <span className="text-white/55">Refunded this month</span>
                    <span className="text-red-300 tabular-nums">−{money(sources.refunds)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px] text-white/50">
                    <span>
                      New customers: <b className="text-white">{money(sources.newMonthly + sources.newYearly)}</b>
                    </span>
                    <span>
                      Renewals: <b className="text-white">{money(sources.renewalsMonthly + sources.renewalsYearly)}</b>
                    </span>
                    <span>
                      Annual plans: <b className="text-white">{money(sources.newYearly + sources.renewalsYearly)}</b>
                    </span>
                    <span>
                      Credit packs: <b className="text-white">{money(sources.creditPacks)}</b>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-white/40">No payments recorded for {selected}.</p>
              )}
            </ChartCard>

            <ChartCard title="Revenue by source over time" subtitle="Each month's paid invoices">
              <Legend items={SOURCES.map((s) => ({ label: s.label, color: s.color }))} />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeline} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="month" {...axisProps} />
                    <YAxis {...axisProps} width={56} tickFormatter={(v) => usdDollars(Number(v), true)} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      content={({ active, label, payload }) => (
                        <TooltipBox
                          active={active}
                          label={String(label ?? "")}
                          rows={(payload ?? []).filter((x) => Number(x.value) > 0).map((x) => ({
                            label: SOURCES.find((s) => s.key === x.dataKey)?.label ?? String(x.dataKey),
                            value: money(Number(x.value)),
                            color: String(x.color),
                          }))}
                        />
                      )}
                    />
                    {SOURCES.map((s, i) => (
                      <Bar key={s.key} dataKey={s.key} stackId="rev" fill={s.color} radius={i === SOURCES.length - 1 ? [3, 3, 0, 0] : 0} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Revenue, cost and profit" subtitle="Net revenue (after Stripe), generation cost and net profit per month">
            <Legend
              items={[
                { label: "Net revenue", color: SERIES[2], line: true },
                { label: "Generation cost", color: SERIES[1], line: true },
                { label: "Net profit", color: "#b89dff", line: true },
              ]}
            />
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} width={56} tickFormatter={(v) => usdDollars(Number(v), true)} />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <TooltipBox
                        active={active}
                        label={String(label ?? "")}
                        rows={(payload ?? []).map((x) => ({
                          label: x.dataKey === "revenue" ? "Net revenue" : x.dataKey === "cost" ? "Generation cost" : "Net profit",
                          value: money(Number(x.value)),
                          color: String(x.color),
                          bold: x.dataKey === "profit",
                        }))}
                      />
                    )}
                  />
                  <Line type="monotone" dataKey="revenue" stroke={SERIES[2]} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="cost" stroke={SERIES[1]} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="profit" stroke="#b89dff" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Models" subtitle={`Generations and cost per model in ${selected}, most expensive first`}>
            {modelRows.length ? (
              <>
                <Legend items={[{ label: "Generations", color: SERIES[0] }, { label: "Cost ($)", color: SERIES[1] }]} />
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelRows.slice(0, 15)} margin={{ top: 5, right: 5, left: 0, bottom: 30 }}>
                      <CartesianGrid stroke={GRID} vertical={false} />
                      <XAxis dataKey="model" {...axisProps} interval={0} angle={-30} textAnchor="end" height={50} />
                      <YAxis yAxisId="n" {...axisProps} width={44} />
                      <YAxis yAxisId="c" orientation="right" {...axisProps} width={50} tickFormatter={(v) => usdDollars(Number(v), true)} />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        content={({ active, label, payload }) => (
                          <TooltipBox
                            active={active}
                            label={String(label ?? "")}
                            rows={(payload ?? []).map((x) => ({
                              label: x.dataKey === "totalCost" ? "Cost" : "Generations",
                              value: x.dataKey === "totalCost" ? money(Number(x.value)) : int(Number(x.value)),
                              color: String(x.color),
                            }))}
                          />
                        )}
                      />
                      <Bar yAxisId="n" dataKey="totalGenerations" fill={SERIES[0]} radius={[3, 3, 0, 0]} />
                      <Bar yAxisId="c" dataKey="totalCost" fill={SERIES[1]} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="text-left text-[11px] tracking-wide text-white/40 uppercase">
                      <tr>
                        <th className="py-2 font-medium">Model</th>
                        <th className="py-2 text-right font-medium">Generations</th>
                        <th className="py-2 text-right font-medium">Cost</th>
                        <th className="py-2 text-right font-medium">Share of cost</th>
                        <th className="py-2 text-right font-medium">Per generation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      {modelRows.map((r) => (
                        <tr key={r.model}>
                          <td className="py-2">{r.model}</td>
                          <td className="py-2 text-right tabular-nums">{int(r.totalGenerations)}</td>
                          <td className="py-2 text-right tabular-nums">{money(r.totalCost)}</td>
                          <td className="py-2 text-right tabular-nums">{pct(data.totalGenerationsCost ? r.totalCost / data.totalGenerationsCost : 0, 0)}</td>
                          <td className={cn("py-2 text-right tabular-nums")}>{money(r.totalGenerations ? r.totalCost / r.totalGenerations : 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="py-10 text-center text-sm text-neutral-500">No generation data for {selected}.</p>
            )}
          </ChartCard>
        </>
      )}
    </div>
  );
}
