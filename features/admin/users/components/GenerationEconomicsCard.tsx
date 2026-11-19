"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { modelName } from "@/features/credits/ledger";
import { useCatalog } from "@/features/catalog/catalog";

const PAGE_SIZE = 25;

interface Totals {
  generations: number;
  credits: number;
  costUsd: number;
  paidUsd: number;
  /** Gross: paid − cost. */
  profitUsd: number;
  stripeFeeUsd?: number;
  /** Gross − Stripe fees. */
  netProfitUsd?: number;
}

interface Summary {
  totals: Totals & { withoutEconomics: number };
  byModel: (Totals & { model: string })[];
}

/** The user's plan when they generated. */
interface PlanSnapshot {
  id: string | null;
  name: string | null;
  billingPeriod: string | null;
  isFree: boolean;
  status: string | null;
}

/** Where a generation was started. */
interface Origin {
  source: "web" | "assistant" | "mcp" | "admin";
  surface: string | null;
  device: "desktop" | "mobile" | "tablet" | null;
  recreatedFrom: { kind: "template" | "generation"; id: string } | null;
}

interface GenerationRow {
  id: string;
  model: string;
  type: string;
  status: string;
  createdAt: string;
  creditsUsed: number;
  costUsd: number | null;
  paidUsd: number | null;
  profitUsd: number | null;
  dollarValuePerCredit: number | null;
  stripeFeeUsd?: number | null;
  netProfitUsd?: number | null;
  grossMarginPct?: number | null;
  netMarginPct?: number | null;
  plan?: PlanSnapshot | null;
  origin?: Origin | null;
  costChain?: string[] | null;
}

const SOURCE_LABEL: Record<Origin["source"], string> = {
  web: "Web",
  assistant: "Assistant",
  mcp: "MCP",
  admin: "Admin",
};

function planText(p: PlanSnapshot | null | undefined): string {
  if (!p) return "—";
  if (p.isFree) return "Free";
  const name = (p.name ?? "Paid").replace(/ plan$/i, "");
  return p.billingPeriod === "YEARLY" ? `${name} · yearly` : name;
}

const pct = (n: number | null | undefined) => (n === null || n === undefined ? "—" : `${n}%`);

async function getJson<T>(url: string, fallback: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? fallback);
  return json as T;
}

/** $ with cents, or more decimals for sub-cent amounts; "—" when unknown. */
function usd(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  const abs = Math.abs(n);
  const digits = abs > 0 && abs < 0.1 ? 4 : 2;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

const profitClass = (n: number | null | undefined) =>
  n === null || n === undefined ? "text-white/40" : n < 0 ? "text-red-300" : n > 0 ? "text-emerald-300" : "text-white/60";

const CARD_STYLE = { borderColor: "rgba(255,255,255,0.07)", background: "oklch(0.13 0 0)" };

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl border px-4 py-3" style={CARD_STYLE}>
      <p className="text-[11px] font-medium tracking-wide text-white/40 uppercase">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold tabular-nums", className ?? "text-white")}>{value}</p>
    </div>
  );
}

/**
 * The user's generations in money terms: what they cost us (provider), what the user
 * paid (credits × their plan's $/credit; 0 on free), gross profit and net profit after
 * Stripe's fees. Totals, a per-model breakdown, and every generation with the plan the
 * user was on and where it was started.
 */
export function GenerationEconomicsCard({ userId }: { userId: string }) {
  // Model names follow the catalog (admin renames).
  useCatalog();
  const [offset, setOffset] = useState(0);
  const summary = useQuery({
    queryKey: ["admin", "user-generation-economics", userId],
    queryFn: () => getJson<Summary>(`/api/admin/users/${userId}/generations/summary`, "Couldn't load the totals"),
  });
  const page = useQuery({
    queryKey: ["admin", "user-generations", userId, offset],
    queryFn: () =>
      getJson<{ total: number; data: GenerationRow[] }>(
        `/api/admin/users/${userId}/generations?offset=${offset}&limit=${PAGE_SIZE}`,
        "Couldn't load the generations",
      ),
    placeholderData: keepPreviousData,
  });

  const t = summary.data?.totals;
  const rows = page.data?.data ?? [];
  const total = page.data?.total ?? 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Generations &amp; profit</h2>
        {(summary.isFetching || page.isFetching) && <Loader2 className="size-4 animate-spin text-white/40" />}
      </div>

      {/* Totals */}
      {summary.isError ? (
        <p className="text-sm text-red-400">Couldn&apos;t load the totals.</p>
      ) : t ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Generations" value={t.generations.toLocaleString()} />
            <Stat label="Credits charged" value={t.credits.toLocaleString()} />
            <Stat label="Cost to us" value={usd(t.costUsd)} />
            <Stat label="User paid" value={usd(t.paidUsd)} />
            <Stat label="Gross profit" value={usd(t.profitUsd)} className={profitClass(t.profitUsd)} />
            <Stat label="Net profit" value={usd(t.netProfitUsd)} className={profitClass(t.netProfitUsd)} />
          </div>
          <p className="text-xs text-white/40">Net is after Stripe&apos;s fees ({usd(t.stripeFeeUsd)}).</p>
          {t.withoutEconomics > 0 && (
            <p className="text-xs text-white/40">
              {t.withoutEconomics.toLocaleString()} older generation{t.withoutEconomics === 1 ? "" : "s"} from before
              cost tracking aren&apos;t included in the $ totals.
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2 text-sm text-white/40">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      )}

      {/* Per model */}
      {!!summary.data?.byModel.length && (
        <div className="overflow-x-auto rounded-xl border" style={CARD_STYLE}>
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-[11px] tracking-wide text-white/40 uppercase">
                <th className="px-4 py-2.5 font-medium">Model</th>
                <th className="px-4 py-2.5 text-right font-medium">Generations</th>
                <th className="px-4 py-2.5 text-right font-medium">Credits</th>
                <th className="px-4 py-2.5 text-right font-medium">Cost</th>
                <th className="px-4 py-2.5 text-right font-medium">Paid</th>
                <th className="px-4 py-2.5 text-right font-medium">Gross</th>
                <th className="px-4 py-2.5 text-right font-medium">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {summary.data.byModel.map((m) => (
                <tr key={m.model}>
                  <td className="px-4 py-2.5 text-white/80">{modelName(m.model)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-white/70">{m.generations.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-white/70">{m.credits.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-white/70">{usd(m.costUsd)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-white/70">{usd(m.paidUsd)}</td>
                  <td className={cn("px-4 py-2.5 text-right tabular-nums", profitClass(m.profitUsd))}>{usd(m.profitUsd)}</td>
                  <td className={cn("px-4 py-2.5 text-right font-medium tabular-nums", profitClass(m.netProfitUsd))}>
                    {usd(m.netProfitUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Each generation */}
      <div className="overflow-x-auto rounded-xl border" style={CARD_STYLE}>
        {page.isError ? (
          <p className="px-6 py-10 text-center text-sm text-red-400">Couldn&apos;t load the generations.</p>
        ) : page.isLoading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm text-white/40">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : !rows.length ? (
          <p className="px-6 py-10 text-center text-sm text-white/35">No generations yet.</p>
        ) : (
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="text-left text-[11px] tracking-wide text-white/40 uppercase">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Model</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Plan</th>
                <th className="px-4 py-2.5 font-medium">Source</th>
                <th className="px-4 py-2.5 text-right font-medium">Credits</th>
                <th className="px-4 py-2.5 text-right font-medium">Cost</th>
                <th className="px-4 py-2.5 text-right font-medium">Paid</th>
                <th className="px-4 py-2.5 text-right font-medium">Gross</th>
                <th className="px-4 py-2.5 text-right font-medium">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {rows.map((g) => (
                <tr key={g.id}>
                  <td className="px-4 py-2.5 whitespace-nowrap text-white/50">
                    {new Date(g.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2.5 text-white/80">
                    {modelName(g.model)}
                    <span className="ml-1.5 text-[11px] text-white/35 capitalize">{g.type}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-white/50 capitalize">{g.status.toLowerCase()}</td>
                  <td
                    className="px-4 py-2.5 text-xs whitespace-nowrap text-white/60"
                    title={g.plan?.status ? `Subscription ${g.plan.status.replace(/_/g, " ")}` : undefined}
                  >
                    {planText(g.plan)}
                  </td>
                  <td className="px-4 py-2.5 text-xs whitespace-nowrap text-white/60" title={g.origin?.surface ?? undefined}>
                    {g.origin ? (
                      <>
                        {SOURCE_LABEL[g.origin.source] ?? g.origin.source}
                        {g.origin.device && <span className="ml-1 text-white/35 capitalize">· {g.origin.device}</span>}
                        {g.origin.recreatedFrom && (
                          <span className="ml-1.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/50">
                            Recreated {g.origin.recreatedFrom.kind}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-white/70">{g.creditsUsed.toLocaleString()}</td>
                  <td
                    className="px-4 py-2.5 text-right tabular-nums text-white/70"
                    title={g.costChain && g.costChain.length > 1 ? `Cost via ${g.costChain.slice(1).map((m) => modelName(m)).join(" → ")}` : undefined}
                  >
                    {usd(g.costUsd)}
                  </td>
                  <td
                    className="px-4 py-2.5 text-right tabular-nums text-white/70"
                    title={
                      g.dollarValuePerCredit !== null
                        ? `${g.creditsUsed} credits × ${usd(g.dollarValuePerCredit)}/credit`
                        : undefined
                    }
                  >
                    {usd(g.paidUsd)}
                  </td>
                  <td
                    className={cn("px-4 py-2.5 text-right tabular-nums", profitClass(g.profitUsd))}
                    title={`Gross margin ${pct(g.grossMarginPct)}`}
                  >
                    {usd(g.profitUsd)}
                  </td>
                  <td
                    className={cn("px-4 py-2.5 text-right font-medium tabular-nums", profitClass(g.netProfitUsd))}
                    title={`After ${usd(g.stripeFeeUsd)} Stripe fee · net margin ${pct(g.netMarginPct)}`}
                  >
                    {usd(g.netProfitUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-3 text-xs text-white/50">
          <span>
            {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            disabled={offset === 0}
            aria-label="Previous page"
            className="rounded-lg border border-white/10 p-1.5 hover:border-white/20 disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setOffset((o) => o + PAGE_SIZE)}
            disabled={offset + PAGE_SIZE >= total}
            aria-label="Next page"
            className="rounded-lg border border-white/10 p-1.5 hover:border-white/20 disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
}
