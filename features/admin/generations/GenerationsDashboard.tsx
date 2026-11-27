"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDown, ArrowUp, BarChart3, CircleDollarSign, Coins, Loader2, Search, TrendingUp, TriangleAlert, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeltaText, KpiTile } from "@/features/admin/components/data-viz/kpi";
import { ChartCard, Legend, TooltipBox } from "@/features/admin/components/data-viz/parts";
import { GRID, SERIES, axisProps } from "@/features/admin/components/data-viz/palette";
import { dayLabel, int, pct, usdDollars } from "@/features/admin/components/data-viz/format";

type Kind = "all" | "model" | "generator";
type UserType = "all" | "paid" | "free";
type Split = "kind" | "users";
type Sort = "generations" | "cost" | "revenue" | "profit" | "failRate" | "name";
type Metric = "generations" | "cost" | "revenue" | "profit";

interface Kpi {
  generations: number;
  paidGenerations: number;
  freeGenerations: number;
  paidUsers: number;
  freeUsers: number;
  failed: number;
  successRate: number | null;
  credits: number;
  cost: number;
  revenue: number;
  profit: number;
  margin: number | null;
}
interface Row {
  model: string;
  name: string;
  kind: "model" | "generator";
  generations: number;
  paidGenerations: number;
  freeGenerations: number;
  failed: number;
  failRate: number;
  credits: number;
  cost: number;
  revenue: number;
  profit: number;
  margin: number | null;
}
interface Stats {
  range: { from: string; to: string; unit: "day" | "week" };
  kpis: { current: Kpi; previous: Kpi };
  series: Record<string, number | string>[];
  rows: Row[];
}

const RANGES = [
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
  { id: "12m", label: "12 months", days: 365 },
] as const;

const METRICS: { id: Metric; label: string }[] = [
  { id: "generations", label: "Generations" },
  { id: "cost", label: "Cost" },
  { id: "revenue", label: "Revenue" },
  { id: "profit", label: "Profit" },
];

const SORTS: { id: Sort; label: string }[] = [
  { id: "generations", label: "Generations" },
  { id: "cost", label: "Cost" },
  { id: "revenue", label: "Revenue" },
  { id: "profit", label: "Profit" },
  { id: "failRate", label: "Fail rate" },
  { id: "name", label: "Name" },
];

/** Midnight UTC `days` ago (stable within a day, so the query key stays the same). */
function startOfDayDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const money = (n: number) => usdDollars(n);

/** Admin → Generations: models vs Smpl generators, over a date range, searchable and sortable. */
export function GenerationsDashboard() {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"] | "custom">("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const [users, setUsers] = useState<UserType>("all");
  const [split, setSplit] = useState<Split>("kind");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("generations");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [metric, setMetric] = useState<Metric>("generations");

  const params = useMemo(() => {
    const p = new URLSearchParams({ kind, users, sort, dir });
    if (range === "custom") {
      if (customFrom) p.set("from", new Date(customFrom).toISOString());
      if (customTo) p.set("to", new Date(new Date(customTo).getTime() + 86_400_000).toISOString());
    } else {
      const days = RANGES.find((r) => r.id === range)!.days;
      p.set("from", startOfDayDaysAgo(days));
    }
    if (search.trim()) p.set("q", search.trim());
    return p.toString();
  }, [range, customFrom, customTo, kind, users, sort, dir, search]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["admin-generation-stats", params],
    queryFn: async () => {
      const res = await fetch(`/api/admin/generations/stats?${params}`);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Couldn't load generations");
      return (json?.data ?? json) as Stats;
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const c = data?.kpis.current;
  const p = data?.kpis.previous;
  const lines =
    split === "users"
      ? [
          ...(users !== "free" ? [{ key: `paid${cap(metric)}`, label: "Paid users", color: SERIES[2] }] : []),
          ...(users !== "paid" ? [{ key: `free${cap(metric)}`, label: "Free users", color: SERIES[3] }] : []),
        ]
      : [
          ...(kind !== "generator" ? [{ key: `model${cap(metric)}`, label: "Models", color: SERIES[0] }] : []),
          ...(kind !== "model" ? [{ key: `generator${cap(metric)}`, label: "Smpl generators", color: SERIES[1] }] : []),
        ];
  const fmt = (n: number) => (metric === "generations" ? int(n) : money(n));

  const toggleSort = (s: Sort) => {
    if (s === sort) setDir(dir === "desc" ? "asc" : "desc");
    else {
      setSort(s);
      setDir(s === "name" ? "asc" : "desc");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Generations</h2>
          <p className="text-sm text-white/50">Third-party models and Smpl generators: volume, cost, revenue and profit.</p>
        </div>
        {isFetching && <Loader2 className="size-4 animate-spin text-white/40" />}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 p-1 text-[13px]">
          {RANGES.map((r) => (
            <button key={r.id} type="button" onClick={() => setRange(r.id)} className={cn("rounded-md px-2.5 py-1", range === r.id ? "bg-white text-black" : "text-white/60 hover:text-white")}>
              {r.label}
            </button>
          ))}
          <button type="button" onClick={() => setRange("custom")} className={cn("rounded-md px-2.5 py-1", range === "custom" ? "bg-white text-black" : "text-white/60 hover:text-white")}>
            Custom
          </button>
        </div>
        {range === "custom" && (
          <div className="flex items-center gap-1.5 text-[13px]">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 rounded-md border border-white/10 bg-white/[0.03] px-2 text-white [color-scheme:dark]" />
            <span className="text-white/40">to</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-8 rounded-md border border-white/10 bg-white/[0.03] px-2 text-white [color-scheme:dark]" />
          </div>
        )}
        <div className="flex gap-1 rounded-lg border border-white/10 p-1 text-[13px]">
          {(["all", "model", "generator"] as Kind[]).map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} className={cn("rounded-md px-2.5 py-1", kind === k ? "bg-white text-black" : "text-white/60 hover:text-white")}>
              {k === "all" ? "All" : k === "model" ? "Models" : "Smpl generators"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg border border-white/10 p-1 text-[13px]" title="Paid: made on a paid plan or with purchased credits">
          {(["all", "paid", "free"] as UserType[]).map((u) => (
            <button key={u} type="button" onClick={() => setUsers(u)} className={cn("rounded-md px-2.5 py-1", users === u ? "bg-white text-black" : "text-white/60 hover:text-white")}>
              {u === "all" ? "All users" : u === "paid" ? "Paid users" : "Free users"}
            </button>
          ))}
        </div>
        <div className="relative min-w-[12rem] flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-white/35" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name" className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] pr-3 pl-8 text-sm text-white outline-none focus:border-white/30" />
        </div>
        <select value={sort} onChange={(e) => toggleSort(e.target.value as Sort)} className="h-9 rounded-lg border border-white/10 bg-[#111] px-2 text-sm text-white">
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              Sort: {s.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setDir(dir === "desc" ? "asc" : "desc")} aria-label="Sort direction" className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-white/70">
          {dir === "desc" ? <ArrowDown className="size-4" /> : <ArrowUp className="size-4" />}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{(error as Error).message}</p>}
      {isLoading && <Loader2 className="size-5 animate-spin text-white/40" />}

      {c && p && (
        <>
          {/* 5 cards: 3 + 2 on laptops, one row only on very wide screens. */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            <KpiTile label="Generations" value={int(c.generations)} accent="blue" icon={BarChart3}>
              <DeltaText now={c.generations} before={p.generations} /> · {pct(c.successRate)} succeeded
            </KpiTile>
            <KpiTile label="By paid users" value={pct(c.generations ? c.paidGenerations / c.generations : null)} accent="sky" icon={Users}>
              {int(c.paidGenerations)} paid · {int(c.freeGenerations)} free · {int(c.paidUsers)} / {int(c.freeUsers)} users
            </KpiTile>
            <KpiTile label="Revenue" value={money(c.revenue)} accent="emerald" icon={CircleDollarSign}>
              <DeltaText now={c.revenue} before={p.revenue} /> · {int(c.credits)} credits
            </KpiTile>
            <KpiTile label="Provider cost" value={money(c.cost)} accent="orange" icon={Coins}>
              <DeltaText now={c.cost} before={p.cost} goodWhenUp={false} />
            </KpiTile>
            <KpiTile label="Profit" value={money(c.profit)} accent="violet" icon={TrendingUp}>
              <DeltaText now={c.profit} before={p.profit} /> · margin {pct(c.margin)}
            </KpiTile>
          </div>

          <ChartCard
            title={`${METRICS.find((m) => m.id === metric)!.label} over time`}
            subtitle={data!.range.unit === "week" ? "Per week" : "Per day"}
            action={
              <div className="flex flex-wrap gap-2">
              <div className="flex gap-1 rounded-lg border border-white/10 p-1 text-[12px]">
                {(["kind", "users"] as Split[]).map((x) => (
                  <button key={x} type="button" onClick={() => setSplit(x)} className={cn("rounded-md px-2 py-0.5", split === x ? "bg-white text-black" : "text-white/60")}>
                    {x === "kind" ? "By type" : "By user"}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 rounded-lg border border-white/10 p-1 text-[12px]">
                {METRICS.map((m) => (
                  <button key={m.id} type="button" onClick={() => setMetric(m.id)} className={cn("rounded-md px-2 py-0.5", metric === m.id ? "bg-white text-black" : "text-white/60")}>
                    {m.label}
                  </button>
                ))}
              </div>
              </div>
            }
          >
            <Legend items={lines.map((l) => ({ label: l.label, color: l.color, line: true }))} />
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data!.series} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="date" {...axisProps} tickFormatter={(v) => dayLabel(String(v))} minTickGap={24} />
                  <YAxis {...axisProps} width={56} tickFormatter={(v) => (metric === "generations" ? int(Number(v)) : usdDollars(Number(v), true))} />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <TooltipBox
                        active={active}
                        label={label ? dayLabel(String(label), true) : ""}
                        rows={(payload ?? []).map((x) => ({
                          label: lines.find((l) => l.key === x.dataKey)?.label ?? String(x.dataKey),
                          value: fmt(Number(x.value)),
                          color: String(x.color),
                        }))}
                      />
                    )}
                  />
                  {lines.map((l) => (
                    <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="bg-white/[0.03] text-left text-[11px] tracking-wide text-white/45 uppercase">
                <tr>
                  {[
                    ["name", "Model"],
                    ["generations", "Generations"],
                    ["split", "Paid / free"],
                    ["failRate", "Fail rate"],
                    ["cost", "Cost"],
                    ["revenue", "Revenue"],
                    ["profit", "Profit"],
                  ].map(([id, label]) => (
                    <th key={id} className={cn("px-4 py-2.5 font-medium", id !== "name" && "text-right")}>
                      {id === "split" ? (
                        label
                      ) : (
                      <button type="button" onClick={() => toggleSort(id as Sort)} className="inline-flex items-center gap-1 uppercase hover:text-white">
                        {label}
                        {sort === id && (dir === "desc" ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />)}
                      </button>
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-right font-medium">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data!.rows.map((r) => (
                  <tr key={r.model} className="text-white/80">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-white">{r.name}</div>
                      <div className="text-xs text-white/40">
                        {r.model} · {r.kind === "generator" ? "Smpl generator" : "Model"}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{int(r.generations)}</td>
                    <td className="px-4 py-2.5 text-right text-white/60 tabular-nums">
                      {int(r.paidGenerations)} / {int(r.freeGenerations)}
                    </td>
                    <td className={cn("px-4 py-2.5 text-right tabular-nums", r.failRate > 0.1 && "text-red-300")}>
                      {r.failRate > 0.1 && <TriangleAlert className="mr-1 inline size-3.5" />}
                      {pct(r.failRate)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{money(r.cost)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{money(r.revenue)}</td>
                    <td className={cn("px-4 py-2.5 text-right tabular-nums", r.profit < 0 && "text-red-300")}>{money(r.profit)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{pct(r.margin)}</td>
                  </tr>
                ))}
                {!data!.rows.length && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-white/40">
                      No generations match.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
