"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  Percent,
  RefreshCw,
  RotateCcw,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import type { BillingAnalytics, PackStats, PeriodKpis, PlanStats, RangeKey } from "./types";

// ─── palette (dataviz reference, dark steps; validated on #161616) ───────────────
const SERIES = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181"]; // blue, orange, aqua, yellow, magenta
const INK = "#f0efec";
const MUTED = "#898781";
const GRID = "#2c2c2a";
const SURFACE = "#161616";
// Sequential blue ramp, low → high (dark mode: higher values are brighter).
const RAMP = ["#184f95", "#1c5cab", "#256abf", "#2a78d6", "#3987e5", "#5598e7", "#6da7ec", "#86b6ef"];

// ─── formatting ────────────────────────────────────────────────────────────────
const usd = (cents: number | null | undefined, compact = false) => {
  const v = (cents ?? 0) / 100;
  if (compact && Math.abs(v) >= 1000)
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(v);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: Math.abs(v) >= 1000 ? 0 : 2 }).format(v);
};
const int = (n: number | null | undefined) => new Intl.NumberFormat("en-US").format(n ?? 0);
const pct = (r: number | null | undefined, digits = 1) => (r == null ? "—" : `${(r * 100).toFixed(digits)}%`);
const months = (m: number | null | undefined) => (m == null ? "—" : `${m.toFixed(1)} mo`);
const monthLabel = (key: string, withYear = false) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    year: withYear ? "2-digit" : undefined,
    timeZone: "UTC",
  });
};
const humanize = (s: string) => (s === "unknown" ? "Not given" : s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()));

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "3", label: "3M" },
  { key: "6", label: "6M" },
  { key: "12", label: "12M" },
  { key: "all", label: "All" },
];

async function fetchAnalytics(range: RangeKey, refresh: boolean): Promise<BillingAnalytics> {
  const res = await fetch(`/api/admin/billing/analytics?months=${range}${refresh ? "&refresh=1" : ""}`);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Could not load analytics");
  return json as BillingAnalytics;
}

const card = "rounded-2xl border border-white/[0.08] bg-[#161616]";

// ─── page ──────────────────────────────────────────────────────────────────────

export function BillingAnalyticsDashboard() {
  const [range, setRange] = useState<RangeKey>("12");
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["admin-billing-analytics", range],
    queryFn: () => fetchAnalytics(range, false),
    staleTime: 60_000,
  });

  const refresh = async () => {
    setRefreshing(true);
    try {
      qc.setQueryData(["admin-billing-analytics", range], await fetchAnalytics(range, true));
    } finally {
      setRefreshing(false);
    }
  };

  const rangeLabel = range === "all" ? "all time" : `the last ${range} months`;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-white/[0.06]">
        <div>
          <h1 className="text-[36px] leading-none tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
            Billing Analytics
          </h1>
          <p className="mt-3 text-[13px] text-white/45">
            Subscriptions and credit packs over <span className="font-semibold text-white/75">{rangeLabel}</span>
            {data && <> · compared with the {range === "all" ? "same length before" : `previous ${range} months`}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-white/[0.08] bg-[#161616] p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  "h-8 px-3.5 rounded-lg text-[13px] font-semibold transition-colors",
                  range === r.key ? "bg-white/[0.1] text-white" : "text-white/50 hover:text-white",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            title="Recalculate now"
            className="w-10 h-10 rounded-xl border border-white/[0.08] bg-[#161616] flex items-center justify-center text-white/55 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", (refreshing || (isFetching && !isLoading)) && "animate-spin")} />
          </button>
        </div>
      </header>

      {isLoading && (
        <div className={cn(card, "h-64 flex items-center justify-center gap-2 text-sm text-white/40")}>
          <Loader2 className="w-4 h-4 animate-spin" /> Crunching billing data…
        </div>
      )}
      {error && <p className="text-[13px] text-red-400">{(error as Error).message}</p>}

      {data && (
        <>
          <Section title="Overview" description={`Totals for ${rangeLabel}. MRR and subscribers are as of today.`}>
            <KpiGrid current={data.kpis.current} previous={data.kpis.previous} />
          </Section>

          <Section title="Growth" description="Subscribers joining, coming back and leaving each month.">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <ChartCard title="Subscriber movement" className="xl:col-span-2">
                <SubscriberMovement data={data} />
              </ChartCard>
              <ChartCard title="Active subscribers" subtitle="Paying at the end of each month">
                <ActiveSubscribers data={data} />
              </ChartCard>
              <ChartCard title="MRR" subtitle="Monthly recurring revenue at list price, end of month">
                <MrrChart data={data} />
              </ChartCard>
            </div>
          </Section>

          <Section title="Revenue" description="Money collected each month, by where it came from. Refunds below zero.">
            <ChartCard title="Revenue by source">
              <RevenueChart data={data} />
            </ChartCard>
          </Section>

          <Section title="Retention" description="Who stays, and for how long.">
            <RetentionTiles data={data} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <ChartCard title="Cohort retention" subtitle="Share still paying N months after they first subscribed" className="xl:col-span-2">
                <CohortTable data={data} />
              </ChartCard>
              <ChartCard title="How long they stay" subtitle={`Paid time of the ${int(data.retention.lifetime.endedCount)} subscriptions that ended`}>
                <LifetimeHistogram data={data} />
              </ChartCard>
            </div>
          </Section>

          <Section title="Cancellations & refunds" description={`What happened in ${rangeLabel}.`}>
            <Cancellations data={data} />
          </Section>

          <Section title="Plans" description="Each subscription plan in this period. MRR and active are as of today.">
            <PlansTable plans={data.plans} />
          </Section>

          <Section title="Credit packs" description="One-time credit purchases in this period.">
            <PacksTable packs={data.packs} />
          </Section>
        </>
      )}
    </div>
  );
}

// ─── layout pieces ─────────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[17px] font-bold text-white">{title}</h2>
        {description && <p className="text-[13px] text-white/40 mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function ChartCard({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(card, "p-5 min-w-0", className)}>
      <p className="text-[14px] font-semibold text-white">{title}</p>
      {subtitle && <p className="text-[12px] text-white/40 mt-0.5">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string; line?: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5 text-[12px] text-white/60">
          <span
            className={cn("inline-block", i.line ? "w-3.5 h-0.5 rounded-full" : "w-2.5 h-2.5 rounded-[3px]")}
            style={{ background: i.color }}
          />
          {i.label}
        </span>
      ))}
    </div>
  );
}

// ─── KPIs ──────────────────────────────────────────────────────────────────────

type Accent = "blue" | "violet" | "emerald" | "red" | "cyan" | "orange" | "amber" | "sky";
const ACCENTS: Record<Accent, { card: string; icon: string }> = {
  blue: { card: "bg-blue-500/[0.06] border-blue-500/15", icon: "bg-blue-500/15 text-blue-400" },
  violet: { card: "bg-violet-500/[0.07] border-violet-500/15", icon: "bg-violet-500/15 text-violet-400" },
  emerald: { card: "bg-emerald-500/[0.06] border-emerald-500/15", icon: "bg-emerald-500/15 text-emerald-400" },
  red: { card: "bg-red-500/[0.06] border-red-500/15", icon: "bg-red-500/15 text-red-400" },
  cyan: { card: "bg-cyan-500/[0.06] border-cyan-500/15", icon: "bg-cyan-500/15 text-cyan-400" },
  orange: { card: "bg-orange-500/[0.06] border-orange-500/15", icon: "bg-orange-500/15 text-orange-400" },
  amber: { card: "bg-amber-500/[0.06] border-amber-500/15", icon: "bg-amber-500/15 text-amber-400" },
  sky: { card: "bg-sky-500/[0.06] border-sky-500/15", icon: "bg-sky-500/15 text-sky-400" },
};

/** Change vs the previous period. `goodWhenUp` false for churn and refunds. */
function Delta({ now, before, goodWhenUp = true, asRate = false }: { now: number; before: number; goodWhenUp?: boolean; asRate?: boolean }) {
  if (!before && !now) return <span className="text-white/35">No change</span>;
  const diff = now - before;
  if (diff === 0) return <span className="text-white/35">Same as before</span>;
  const up = diff > 0;
  const good = up === goodWhenUp;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const text = asRate
    ? `${(Math.abs(diff) * 100).toFixed(1)} pts`
    : before
      ? `${Math.abs((diff / before) * 100).toFixed(0)}%`
      : "new";
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-semibold", good ? "text-emerald-400" : "text-red-400")}>
      <Icon className="w-3.5 h-3.5" />
      {text}
      <span className="font-normal text-white/35 ml-1">vs before</span>
    </span>
  );
}

function Kpi({
  label,
  value,
  accent,
  icon: Icon,
  children,
}: {
  label: string;
  value: string;
  accent: Accent;
  icon: LucideIcon;
  children?: React.ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <div className={cn("rounded-2xl border p-5 min-w-0 flex items-center gap-3", a.card)}>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-white/55">{label}</p>
        <p className="mt-2.5 text-[28px] font-bold leading-none tabular-nums text-white truncate">{value}</p>
        {children && <div className="mt-3 text-[12px] text-white/40 leading-snug">{children}</div>}
      </div>
      <div className={cn("w-10 h-10 shrink-0 rounded-xl flex items-center justify-center", a.icon)}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function KpiGrid({ current: c, previous: p }: { current: PeriodKpis; previous: PeriodKpis }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <Kpi label="MRR" value={usd(c.mrr)} accent="blue" icon={TrendingUp}>
        <Delta now={c.mrr} before={p.mrr} />
      </Kpi>
      <Kpi label="Active subscribers" value={int(c.activeSubscribers)} accent="violet" icon={Users}>
        <Delta now={c.activeSubscribers} before={p.activeSubscribers} />
      </Kpi>
      <Kpi label="New subscribers" value={int(c.newSubscribers)} accent="emerald" icon={UserPlus}>
        <Delta now={c.newSubscribers} before={p.newSubscribers} />
      </Kpi>
      <Kpi label="Churned" value={int(c.churned)} accent="red" icon={UserMinus}>
        <span className="font-semibold text-white/70">{pct(c.churnRate)}</span> churn rate ·{" "}
        <Delta now={c.churnRate} before={p.churnRate} goodWhenUp={false} asRate />
      </Kpi>
      <Kpi label="Net revenue" value={usd(c.netRevenue)} accent="cyan" icon={Wallet}>
        <span className="font-semibold text-white/70">{usd(c.grossRevenue)}</span> before refunds ·{" "}
        <Delta now={c.netRevenue} before={p.netRevenue} />
      </Kpi>
      <Kpi label="Refunds" value={usd(c.refunds.amount)} accent="orange" icon={RotateCcw}>
        <span className="font-semibold text-white/70">{int(c.refunds.count)}</span> refunded payments ·{" "}
        <Delta now={c.refunds.amount} before={p.refunds.amount} goodWhenUp={false} />
      </Kpi>
      <Kpi label="Credit pack revenue" value={usd(c.creditPackRevenue)} accent="amber" icon={Package}>
        <span className="font-semibold text-white/70">{int(c.creditPackPurchases)}</span> purchases ·{" "}
        <Delta now={c.creditPackRevenue} before={p.creditPackRevenue} />
      </Kpi>
      <Kpi label="Free → paid" value={pct(c.conversion.rate)} accent="sky" icon={Percent}>
        <span className="font-semibold text-white/70">{int(c.conversion.converted)}</span> of {int(c.conversion.signups)} signups
        paid · <Delta now={c.conversion.rate} before={p.conversion.rate} asRate />
      </Kpi>
    </div>
  );
}

// ─── charts ────────────────────────────────────────────────────────────────────

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: MUTED, fontSize: 11 },
} as const;

function TooltipBox({
  active,
  label,
  rows,
}: {
  active?: boolean;
  label?: string;
  rows: { label: string; value: string; color?: string; bold?: boolean }[];
}) {
  if (!active) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1f1f1f] px-3 py-2.5 shadow-xl text-[12px] min-w-[170px]">
      {label && <p className="font-semibold text-white mb-1.5">{monthLabel(label, true)}</p>}
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-white/60">
              {r.color && <span className="w-2 h-2 rounded-[2px]" style={{ background: r.color }} />}
              {r.label}
            </span>
            <span className={cn("tabular-nums text-white", r.bold && "font-bold")}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const cfg = (keys: string[]): ChartConfig => Object.fromEntries(keys.map((k, i) => [k, { label: k, color: SERIES[i] }]));

function SubscriberMovement({ data }: { data: BillingAnalytics }) {
  const rows = data.monthly.map((m) => ({ month: m.month, new: m.new, reactivated: m.reactivated, churned: -m.churned, src: m }));
  return (
    <>
      <Legend
        items={[
          { label: "New", color: SERIES[0] },
          { label: "Came back", color: SERIES[1] },
          { label: "Churned", color: SERIES[2] },
        ]}
      />
      <ChartContainer config={cfg(["new", "reactivated", "churned"])} className="h-[260px] w-full aspect-auto">
        <BarChart data={rows} stackOffset="sign" barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="month" tickFormatter={(k) => monthLabel(k)} {...axisProps} />
          <YAxis allowDecimals={false} tickFormatter={(v) => int(Math.abs(v))} width={36} {...axisProps} />
          <ReferenceLine y={0} stroke="#383835" />
          <ChartTooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={({ active, payload, label }) => {
              const m = payload?.[0]?.payload?.src;
              return (
                <TooltipBox
                  active={active && !!m}
                  label={label as string}
                  rows={
                    m
                      ? [
                          { label: "New", value: int(m.new), color: SERIES[0] },
                          { label: "Came back", value: int(m.reactivated), color: SERIES[1] },
                          { label: "Churned", value: int(m.churned), color: SERIES[2] },
                          { label: "  voluntary", value: int(m.churnedVoluntary) },
                          { label: "  failed payment", value: int(m.churnedPaymentFailed) },
                          { label: "Net", value: `${m.new + m.reactivated - m.churned >= 0 ? "+" : ""}${m.new + m.reactivated - m.churned}`, bold: true },
                        ]
                      : []
                  }
                />
              );
            }}
          />
          <Bar dataKey="new" stackId="s" fill={SERIES[0]} stroke={SURFACE} strokeWidth={2} />
          <Bar dataKey="reactivated" stackId="s" fill={SERIES[1]} stroke={SURFACE} strokeWidth={2} radius={[4, 4, 0, 0]} />
          <Bar dataKey="churned" stackId="s" fill={SERIES[2]} stroke={SURFACE} strokeWidth={2} radius={[0, 0, 4, 4]} />
        </BarChart>
      </ChartContainer>
    </>
  );
}

function ActiveSubscribers({ data }: { data: BillingAnalytics }) {
  return (
    <ChartContainer config={cfg(["activeEnd"])} className="h-[220px] w-full aspect-auto">
      <LineChart data={data.monthly}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="month" tickFormatter={(k) => monthLabel(k)} {...axisProps} />
        <YAxis allowDecimals={false} width={36} {...axisProps} />
        <ChartTooltip
          cursor={{ stroke: "#383835" }}
          content={({ active, payload, label }) => (
            <TooltipBox
              active={active}
              label={label as string}
              rows={[{ label: "Active", value: int(payload?.[0]?.value as number), color: SERIES[0], bold: true }]}
            />
          )}
        />
        <Line dataKey="activeEnd" stroke={SERIES[0]} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: SURFACE, strokeWidth: 2 }} />
      </LineChart>
    </ChartContainer>
  );
}

function MrrChart({ data }: { data: BillingAnalytics }) {
  return (
    <ChartContainer config={cfg(["mrrEnd"])} className="h-[220px] w-full aspect-auto">
      <AreaChart data={data.monthly}>
        <defs>
          <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.35} />
            <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="month" tickFormatter={(k) => monthLabel(k)} {...axisProps} />
        <YAxis tickFormatter={(v) => usd(v, true)} width={52} {...axisProps} />
        <ChartTooltip
          cursor={{ stroke: "#383835" }}
          content={({ active, payload, label }) => (
            <TooltipBox
              active={active}
              label={label as string}
              rows={[{ label: "MRR", value: usd(payload?.[0]?.value as number), color: SERIES[0], bold: true }]}
            />
          )}
        />
        <Area
          dataKey="mrrEnd"
          stroke={SERIES[0]}
          strokeWidth={2}
          fill="url(#mrrFill)"
          activeDot={{ r: 5, stroke: SURFACE, strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}

const REVENUE_SERIES = [
  { key: "subscriptionNew", label: "New subscriptions", color: SERIES[0] },
  { key: "renewals", label: "Renewals", color: SERIES[1] },
  { key: "changes", label: "Plan changes", color: SERIES[2] },
  { key: "creditPacks", label: "Credit packs", color: SERIES[3] },
  { key: "refunds", label: "Refunds", color: SERIES[4] },
] as const;

function RevenueChart({ data }: { data: BillingAnalytics }) {
  const rows = data.monthly.map((m) => ({
    month: m.month,
    subscriptionNew: m.revenue.subscriptionNew,
    renewals: m.revenue.renewals,
    changes: m.revenue.changes,
    creditPacks: m.revenue.creditPacks,
    refunds: -m.revenue.refunds,
    net: m.revenue.net,
    src: m,
  }));
  return (
    <>
      <Legend items={[...REVENUE_SERIES.map((s) => ({ label: s.label, color: s.color })), { label: "Net", color: INK, line: true }]} />
      <ChartContainer config={cfg(REVENUE_SERIES.map((s) => s.key))} className="h-[300px] w-full aspect-auto">
        <ComposedChart data={rows} stackOffset="sign" barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="month" tickFormatter={(k) => monthLabel(k)} {...axisProps} />
          <YAxis tickFormatter={(v) => usd(v, true)} width={56} {...axisProps} />
          <ReferenceLine y={0} stroke="#383835" />
          <ChartTooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={({ active, payload, label }) => {
              const m = payload?.[0]?.payload?.src;
              return (
                <TooltipBox
                  active={active && !!m}
                  label={label as string}
                  rows={
                    m
                      ? [
                          ...REVENUE_SERIES.map((s) => ({
                            label: s.label,
                            value: (s.key === "refunds" ? "−" : "") + usd(m.revenue[s.key]),
                            color: s.color,
                          })),
                          { label: "Net", value: usd(m.revenue.net), bold: true },
                        ]
                      : []
                  }
                />
              );
            }}
          />
          {REVENUE_SERIES.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              stackId="r"
              fill={s.color}
              stroke={SURFACE}
              strokeWidth={2}
              radius={i === 3 ? [4, 4, 0, 0] : i === 4 ? [0, 0, 4, 4] : undefined}
            />
          ))}
          <Line dataKey="net" stroke={INK} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: SURFACE, strokeWidth: 2 }} />
        </ComposedChart>
      </ChartContainer>
    </>
  );
}

function LifetimeHistogram({ data }: { data: BillingAnalytics }) {
  const rows = data.retention.lifetime.histogram;
  return (
    <ChartContainer config={cfg(["count"])} className="h-[240px] w-full aspect-auto">
      <BarChart data={rows} barCategoryGap="22%">
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" {...axisProps} interval={0} tick={{ fill: MUTED, fontSize: 10 }} />
        <YAxis allowDecimals={false} width={32} {...axisProps} />
        <ChartTooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          content={({ active, payload }) => {
            const r = payload?.[0]?.payload as { label: string; count: number } | undefined;
            return (
              <TooltipBox
                active={active && !!r}
                rows={r ? [{ label: `Stayed ${r.label}`, value: int(r.count), color: SERIES[0], bold: true }] : []}
              />
            );
          }}
        />
        <Bar dataKey="count" fill={SERIES[0]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

// ─── retention ─────────────────────────────────────────────────────────────────

function StatTile({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
  return (
    <div className="px-5 py-4 min-w-0">
      <p className="text-[12px] font-medium text-white/45">{label}</p>
      <p className="mt-1.5 text-[22px] font-bold tabular-nums text-white leading-tight">{value}</p>
      {sub && <p className="mt-1 text-[12px] text-white/35">{sub}</p>}
    </div>
  );
}

function RetentionTiles({ data }: { data: BillingAnalytics }) {
  const r = data.retention;
  return (
    <div className={cn(card, "grid grid-cols-2 lg:grid-cols-5 divide-x divide-white/[0.05]")}>
      <StatTile
        label="Still paying"
        value={pct(r.stayedRate)}
        sub={
          <>
            <span className="font-semibold text-white/65">{int(r.stillPaying)}</span> of {int(r.everSubscribed)} who ever subscribed
          </>
        }
      />
      <StatTile label="Median stay" value={months(r.lifetime.medianMonths)} sub={`average ${months(r.lifetime.averageMonths)}, ended subs`} />
      <StatTile label="Current subscribers so far" value={months(r.lifetime.averageActiveTenureMonths)} sub="average time paying" />
      <StatTile label="First renewal" value={pct(r.renewalRate)} sub={`of ${int(r.renewalEligible)} that reached it`} />
      <StatTile label="Avg lifetime value" value={usd(r.averageLifetimeValue)} sub="per paying customer" />
    </div>
  );
}

function rampColor(v: number) {
  const i = Math.min(RAMP.length - 1, Math.max(0, Math.round(v * (RAMP.length - 1))));
  return { bg: RAMP[i], fg: i >= 5 ? "#0b0b0b" : "#ffffff" };
}

function CohortTable({ data }: { data: BillingAnalytics }) {
  const cohorts = data.retention.cohorts.filter((c) => c.size > 0);
  if (!cohorts.length) return <p className="text-[13px] text-white/40">No subscribers in this range yet.</p>;
  const cols = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px] border-separate" style={{ borderSpacing: 2 }}>
        <thead>
          <tr className="text-white/40">
            <th className="text-left font-semibold px-2 py-1.5">Started</th>
            <th className="text-right font-semibold px-2 py-1.5">Users</th>
            {cols.map((c) => (
              <th key={c} className="font-semibold px-1 py-1.5 text-center w-[46px]">
                M{c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c) => (
            <tr key={c.month}>
              <td className="px-2 py-1.5 font-semibold text-white/80 whitespace-nowrap">{monthLabel(c.month, true)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-white/55">{int(c.size)}</td>
              {c.retention.map((v, i) => {
                if (v == null) return <td key={i} className="rounded-md bg-white/[0.02]" />;
                const { bg, fg } = rampColor(v);
                return (
                  <td
                    key={i}
                    title={`${monthLabel(c.month, true)} cohort: ${pct(v, 0)} still paying after ${i + 1} month${i ? "s" : ""}`}
                    className="rounded-md text-center tabular-nums font-semibold py-1.5 cursor-default"
                    style={{ background: bg, color: fg }}
                  >
                    {Math.round(v * 100)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-white/40">
        <span>0%</span>
        <div className="flex">
          {RAMP.map((c) => (
            <span key={c} className="w-5 h-2" style={{ background: c }} />
          ))}
        </div>
        <span>100%</span>
        <span className="ml-2">Numbers are % still paying. Empty cells haven&apos;t been reached yet.</span>
      </div>
    </div>
  );
}

// ─── cancellations ─────────────────────────────────────────────────────────────

function BarList({ rows, total, empty }: { rows: { key: string; count: number }[]; total: number; empty: string }) {
  if (!rows.length) return <p className="text-[13px] text-white/40">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <div className="space-y-2.5">
      {rows.slice(0, 8).map((r) => (
        <div key={r.key} title={`${humanize(r.key)}: ${r.count}`}>
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="text-white/75">{humanize(r.key)}</span>
            <span className="tabular-nums text-white/55">
              <span className="font-semibold text-white">{int(r.count)}</span> · {pct(r.count / (total || 1), 0)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(r.count / max) * 100}%`, background: SERIES[0] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Cancellations({ data }: { data: BillingAnalytics }) {
  const c = data.cancellations;
  return (
    <div className="space-y-4">
      <div className={cn(card, "grid grid-cols-2 lg:grid-cols-6 divide-x divide-white/[0.05]")}>
        <StatTile
          label="Ended"
          value={int(c.total)}
          sub={
            <>
              <span className="font-semibold text-white/65">{int(c.voluntary)}</span> chose to ·{" "}
              <span className="font-semibold text-white/65">{int(c.paymentFailed)}</span> failed payment
            </>
          }
        />
        <StatTile label="Canceling now" value={int(c.cancelingNow)} sub="end at period end" />
        <StatTile
          label="Saved"
          value={int(c.undone)}
          sub={`of ${int(c.scheduled)} cancels scheduled (${pct(c.scheduled ? c.undone / c.scheduled : 0, 0)})`}
        />
        <StatTile
          label="Payment failures"
          value={int(c.paymentFailures)}
          sub={`${int(c.paymentRecoveries)} recovered`}
        />
        <StatTile
          label="Refunds"
          value={usd(c.refunds.amount)}
          sub={`${int(c.refunds.count)} payments · ${pct(c.refunds.rate)} of all · ${int(c.refunds.full)} full, ${int(c.refunds.partial)} partial`}
        />
        <StatTile label="Disputes" value={int(c.disputes)} sub="chargebacks opened" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Why they left" subtitle="Reason given when canceling (voluntary only)">
          <BarList rows={c.feedback} total={c.voluntary} empty="No voluntary cancellations in this period." />
        </ChartCard>
        <ChartCard title="Who ended it" subtitle="User, admin, Stripe (failed payments) or system">
          <BarList rows={c.by} total={c.total} empty="No cancellations in this period." />
        </ChartCard>
      </div>
    </div>
  );
}

// ─── tables ────────────────────────────────────────────────────────────────────

interface Column<T> {
  key: string;
  label: string;
  value: (r: T) => number | string | null;
  render?: (r: T) => React.ReactNode;
  align?: "left" | "right";
}

function SortableTable<T extends { id: string }>({ rows, columns, initial, empty }: { rows: T[]; columns: Column<T>[]; initial: string; empty: string }) {
  const [sort, setSort] = useState<{ key: string; desc: boolean }>({ key: initial, desc: true });
  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort.key)!;
    return [...rows].sort((a, b) => {
      const x = col.value(a) ?? -Infinity;
      const y = col.value(b) ?? -Infinity;
      const cmp = typeof x === "string" || typeof y === "string" ? String(x).localeCompare(String(y)) : (x as number) - (y as number);
      return sort.desc ? -cmp : cmp;
    });
  }, [rows, columns, sort]);

  if (!rows.length) return <div className={cn(card, "p-5 text-[13px] text-white/40")}>{empty}</div>;

  return (
    <div className={cn(card, "overflow-x-auto")}>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-white/40">
            {columns.map((c) => (
              <th key={c.key} className={cn("px-4 py-3 font-semibold whitespace-nowrap", c.align === "left" ? "text-left" : "text-right")}>
                <button
                  onClick={() => setSort((s) => ({ key: c.key, desc: s.key === c.key ? !s.desc : true }))}
                  className={cn("inline-flex items-center gap-1 hover:text-white", sort.key === c.key && "text-white/80")}
                >
                  {c.label}
                  {sort.key === c.key && (sort.desc ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {sorted.map((r) => (
            <tr key={r.id} className="hover:bg-white/[0.02]">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4 py-3 tabular-nums whitespace-nowrap", c.align === "left" ? "text-left" : "text-right text-white/70")}>
                  {c.render ? c.render(r) : String(c.value(r) ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlansTable({ plans }: { plans: PlanStats[] }) {
  const columns: Column<PlanStats>[] = [
    {
      key: "name",
      label: "Plan",
      align: "left",
      value: (p) => p.name,
      render: (p) => (
        <span>
          <span className="font-semibold text-white">{p.name}</span>
          <span className="ml-2 text-white/35">
            ${p.priceAmount}/{p.billingPeriod === "YEARLY" ? "yr" : "mo"}
          </span>
        </span>
      ),
    },
    { key: "activeNow", label: "Active", value: (p) => p.activeNow, render: (p) => <b className="font-semibold text-white">{int(p.activeNow)}</b> },
    { key: "mrrNow", label: "MRR", value: (p) => p.mrrNow, render: (p) => <b className="font-semibold text-white">{usd(p.mrrNow)}</b> },
    { key: "new", label: "New", value: (p) => p.new, render: (p) => int(p.new) },
    { key: "churned", label: "Churned", value: (p) => p.churned, render: (p) => int(p.churned) },
    { key: "churnRate", label: "Churn rate", value: (p) => p.churnRate, render: (p) => pct(p.churnRate) },
    { key: "revenue", label: "Revenue", value: (p) => p.revenue, render: (p) => usd(p.revenue) },
    { key: "refunds", label: "Refunds", value: (p) => p.refunds, render: (p) => (p.refunds ? usd(p.refunds) : "—") },
    { key: "life", label: "Avg stay", value: (p) => p.averageLifetimeMonths, render: (p) => months(p.averageLifetimeMonths) },
    { key: "coupon", label: "With coupon", value: (p) => p.couponShare, render: (p) => (p.new ? pct(p.couponShare, 0) : "—") },
  ];
  return <SortableTable rows={plans} columns={columns} initial="mrrNow" empty="No paid plans with activity in this period." />;
}

function PacksTable({ packs }: { packs: PackStats[] }) {
  const columns: Column<PackStats>[] = [
    {
      key: "name",
      label: "Pack",
      align: "left",
      value: (p) => p.name,
      render: (p) => (
        <span>
          <span className="font-semibold text-white">{p.name}</span>
          <span className="ml-2 text-white/35">
            {int(p.credits)} credits · ${p.priceAmount}
          </span>
        </span>
      ),
    },
    { key: "purchases", label: "Purchases", value: (p) => p.purchases, render: (p) => <b className="font-semibold text-white">{int(p.purchases)}</b> },
    { key: "revenue", label: "Revenue", value: (p) => p.revenue, render: (p) => <b className="font-semibold text-white">{usd(p.revenue)}</b> },
    { key: "refunds", label: "Refunds", value: (p) => p.refunds, render: (p) => (p.refunds ? usd(p.refunds) : "—") },
    { key: "buyers", label: "Buyers", value: (p) => p.buyers, render: (p) => int(p.buyers) },
    { key: "repeat", label: "Bought again", value: (p) => p.repeatBuyerRate, render: (p) => pct(p.repeatBuyerRate, 0) },
    { key: "subs", label: "Also subscribe", value: (p) => p.subscriberRate, render: (p) => pct(p.subscriberRate, 0) },
  ];
  return <SortableTable rows={packs} columns={columns} initial="revenue" empty="No credit pack purchases in this period." />;
}

