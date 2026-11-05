"use client";

import { useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Coins,
  RefreshCw,
  Sparkles,
  Wallet,
  Wand2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AUDIO_MODELS,
  IMAGE_MODELS,
  STUDIO_MODELS,
  VIDEO_MODELS,
} from "@/features/generation/enums/models.enum";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  IconSquare,
  SettingsHeader,
  SettingsPanel,
  SettingsTile,
} from "../_components/SettingsUi";

type Range = "7d" | "30d" | "90d";

const RANGES: { value: Range; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const PAGE_SIZE = 50;

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

interface UsageData {
  totalCost: number;
  currency: string;
  creditsSpent: number;
  featuresUsed: number;
  totalGenerations: number;
  daily: { date: string; credits: number }[];
  byFeature: { model: string; count: number; credits: number }[];
  history: { data: CreditTransaction[]; total: number };
}

const MODEL_NAMES = new Map(
  [...IMAGE_MODELS, ...VIDEO_MODELS, ...AUDIO_MODELS, ...STUDIO_MODELS].map((m) => [
    m.id as string,
    m.name,
  ]),
);

const modelName = (model: string) =>
  MODEL_NAMES.get(model) ??
  model
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** Label and colour per credit transaction type. */
const TYPE_STYLES: Record<string, { label: string; className: string }> = {
  USAGE: { label: "Usage", className: "bg-red-500/15 text-red-300" },
  REFUND: { label: "Refund", className: "bg-emerald-500/15 text-emerald-300" },
  PURCHASE: { label: "Purchase", className: "bg-emerald-500/15 text-emerald-300" },
  SUBSCRIPTION_GRANT: { label: "Subscription", className: "bg-blue-500/15 text-blue-300" },
  BONUS: { label: "Bonus", className: "bg-violet-500/15 text-violet-300" },
  REFERRAL: { label: "Referral", className: "bg-amber-500/15 text-amber-300" },
  FRAUD: { label: "Adjustment", className: "bg-white/10 text-white/60" },
  OTHER: { label: "Other", className: "bg-white/10 text-white/60" },
};

/** Spending types take credits away; everything else adds them. */
const isSpend = (t: CreditTransaction) => t.type === "USAGE" || t.type === "FRAUD";

async function fetchUsage(range: Range, offset: number): Promise<UsageData> {
  const res = await fetch(`/api/usage?range=${range}&offset=${offset}&limit=${PAGE_SIZE}`);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "Could not load usage");
  return json;
}

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export default function UsagePage() {
  const [range, setRange] = useState<Range>("7d");

  const { data, isLoading, isError, isFetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["usage", range],
      queryFn: ({ pageParam }) => fetchUsage(range, pageParam),
      initialPageParam: 0,
      getNextPageParam: (last, pages) => {
        const loaded = pages.reduce((n, p) => n + p.history.data.length, 0);
        return loaded < last.history.total ? loaded : undefined;
      },
    });

  const overview = data?.pages[0];
  const history = data?.pages.flatMap((p) => p.history.data) ?? [];
  const hasSpend = !!overview && overview.creditsSpent > 0;

  const money = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (overview?.currency ?? "usd").toUpperCase(),
      maximumFractionDigits: value > 0 && value < 1 ? 2 : 0,
    }).format(value);

  const stats = [
    { icon: Wallet, label: "Total cost", value: money(overview?.totalCost ?? 0) },
    { icon: Coins, label: "Credits spent", value: (overview?.creditsSpent ?? 0).toLocaleString() },
    { icon: Sparkles, label: "Features used", value: (overview?.featuresUsed ?? 0).toLocaleString() },
    { icon: Wand2, label: "Total generations", value: (overview?.totalGenerations ?? 0).toLocaleString() },
  ];

  return (
    <div className="flex flex-col gap-5">
      <SettingsHeader
        title="Usage"
        subtitle="View credits usage, history and statistics"
        actions={
          <>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex h-9 items-center gap-2 rounded-lg bg-white/[0.06] px-3 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
            >
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
              Refresh
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                  <Calendar className="size-3.5" />
                  {RANGES.find((r) => r.value === range)?.label}
                  <ChevronDown className="size-3.5 text-white/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {RANGES.map((r) => (
                  <DropdownMenuItem key={r.value} onSelect={() => setRange(r.value)}>
                    {r.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {isError && (
        <p className="text-sm text-red-300">Could not load usage. Try Refresh.</p>
      )}

      {/* Spend overview */}
      <SettingsPanel
        icon={BarChart3}
        title="Spend overview"
        action={
          <Link
            href="/pricing"
            className="rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/5"
          >
            Learn more
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {stats.map((s) => (
            <SettingsTile key={s.label} className="flex items-start gap-3">
              <IconSquare icon={s.icon} className="size-9 rounded-lg" />
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-base font-bold text-white tabular-nums",
                    isLoading && "animate-pulse text-white/30",
                  )}
                >
                  {s.value}
                </p>
                <p className="truncate text-sm text-white/50">{s.label}</p>
              </div>
            </SettingsTile>
          ))}
        </div>

        {isLoading ? (
          <SettingsTile className="h-64 animate-pulse" />
        ) : hasSpend ? (
          <>
            <SettingsTile className="pt-5 pr-2 pb-2 pl-0">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview.daily} margin={{ left: 0, right: 8 }}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={shortDate}
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={16}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={44}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      contentStyle={{
                        background: "#1c1d20",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                      itemStyle={{ color: "#fff" }}
                      labelFormatter={(d) => shortDate(String(d))}
                      formatter={(v) => [`${Number(v).toLocaleString()} credits`, "Spent"]}
                    />
                    <Bar dataKey="credits" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SettingsTile>

            {/* Per feature */}
            <SettingsTile className="p-0">
              <div className="divide-y divide-white/[0.05]">
                {overview.byFeature.map((f) => (
                  <div key={f.model} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="truncate text-sm text-white/80">{modelName(f.model)}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-white/40">
                        {f.count} {f.count === 1 ? "run" : "runs"}
                      </span>
                      <span className="text-sm font-semibold text-white tabular-nums">
                        {f.credits.toLocaleString()} cr
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </SettingsTile>
          </>
        ) : (
          <EmptyState
            title="No spend data yet"
            text="Feature usage will appear here once you start spending credits."
          />
        )}
      </SettingsPanel>

      {/* Usage history */}
      <SettingsPanel icon={BarChart3} title="Usage history">
        {isLoading ? (
          <SettingsTile className="h-40 animate-pulse" />
        ) : history.length ? (
          <SettingsTile className="p-0">
            <div className="divide-y divide-white/[0.05]">
              {history.map((t) => {
                const style = TYPE_STYLES[t.type] ?? TYPE_STYLES.OTHER;
                const spend = isSpend(t);
                return (
                  <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                          style.className,
                        )}
                      >
                        {style.label}
                      </span>
                      <span className="truncate text-xs text-white/45">
                        {new Date(t.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          spend ? "text-red-300" : "text-emerald-300",
                        )}
                      >
                        {spend ? "−" : "+"}
                        {Math.abs(t.amount).toLocaleString()}
                      </span>
                      <span className="hidden w-28 text-right text-xs text-white/40 tabular-nums sm:block">
                        Balance {t.balanceAfter.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {hasNextPage && (
              <div className="flex justify-center border-t border-white/[0.05] py-3">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {isFetchingNextPage ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </SettingsTile>
        ) : (
          <EmptyState
            title="No usage history yet"
            text="Credit transactions will appear here once you start using features."
          />
        )}
      </SettingsPanel>
    </div>
  );
}
