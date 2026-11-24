"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlarmClock, Gavel, Scale, Trophy } from "lucide-react";
import { KpiTile } from "@/features/admin/components/data-viz/kpi";
import { int, pct, usd } from "@/features/admin/components/data-viz/format";
import { cn } from "@/lib/utils";
import { Badge, billingApi, inputClass, money, Pager, Paged, Section, Tone, UserLink, when } from "./shared";

export interface DisputeRow {
  id: string;
  disputeId: string;
  chargeId: string | null;
  paymentIntentId: string | null;
  invoiceId: string | null;
  stripeCustomerId: string | null;
  userId: string | null;
  email: string | null;
  amount: number;
  currency: string;
  reason: string | null;
  networkReasonCode: string | null;
  status: string;
  isChargeRefundable: boolean | null;
  evidenceDueBy: string | null;
  stripeCreatedAt: string | null;
  closedAt: string | null;
  outcome: "won" | "lost" | "warning_closed" | null;
  fundsWithdrawn: boolean;
  fundsReinstated: boolean;
  accountSuspended: boolean;
  subscriptionCanceled: boolean;
  evidenceBuiltAt: string | null;
  evidenceError: string | null;
  stripeDraftAt: string | null;
  notes: string;
  createdAt: string;
}

interface Stats {
  total: number;
  open: number;
  dueSoon: number;
  atStake: number;
  won: number;
  lost: number;
  winRate: number | null;
}

const CLOSED = new Set(["won", "lost", "warning_closed"]);

export function disputeStatusTone(status: string): Tone {
  if (status === "won") return "green";
  if (status === "lost") return "red";
  if (status === "warning_closed") return "gray";
  if (status.includes("needs_response")) return "amber";
  return "sky";
}

export const statusLabel = (s: string) => s.replaceAll("_", " ");

/** The current time, updated every minute (null until mounted). */
function useNow(everyMs = 60_000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, everyMs);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [everyMs]);
  return now;
}

/** "3 days left" / "5 h left" / "Overdue", colored by urgency. */
export function DueIn({ due, status }: { due: string | null; status: string }) {
  const now = useNow();
  if (!due || CLOSED.has(status) || status === "under_review" || status === "warning_under_review")
    return <span className="text-white/30">—</span>;
  if (now === null) return <span className="text-white/30">…</span>;
  const ms = new Date(due).getTime() - now;
  const hours = ms / 3_600_000;
  const text = ms < 0 ? "Overdue" : hours < 48 ? `${Math.max(1, Math.round(hours))} h left` : `${Math.floor(hours / 24)} days left`;
  return <span className={cn("font-semibold", ms < 0 || hours < 72 ? "text-red-300" : hours < 24 * 7 ? "text-amber-300" : "text-white/60")}>{text}</span>;
}

/** Admin → Billing → Disputes: chargebacks, their deadlines and outcomes. */
export function DisputesDashboard() {
  const router = useRouter();
  const params = useSearchParams();
  // ?q=dp_… (from the user page) and ?status= open the list filtered.
  const [status, setStatus] = useState(params.get("status") ?? "open");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [search, setSearch] = useState(params.get("q")?.trim() ?? "");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(q.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const stats = useQuery({ queryKey: ["admin-dispute-stats"], queryFn: () => billingApi<Stats>("/disputes/stats") });
  const query = new URLSearchParams({ page: String(page), limit: "25", ...(status ? { status } : {}), ...(search ? { q: search } : {}) });
  const list = useQuery({ queryKey: ["admin-disputes", query.toString()], queryFn: () => billingApi<Paged<DisputeRow>>(`/disputes?${query}`) });
  const s = stats.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Gavel className="size-6 text-amber-400" /> Disputes
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-white/50">
          When a customer disputes a payment, their account is suspended, their plan ends, and the evidence (sign-ins, devices, usage,
          downloads, receipts, support messages, policies) is gathered here, ready to download or send to Stripe.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile label="Open" value={s ? int(s.open) : "…"} accent="amber" icon={Scale}>
          {s ? `${int(s.total)} disputes in total` : null}
        </KpiTile>
        <KpiTile label="Due within 3 days" value={s ? int(s.dueSoon) : "…"} accent={s?.dueSoon ? "red" : "emerald"} icon={AlarmClock}>
          Respond in Stripe before the deadline.
        </KpiTile>
        <KpiTile label="At stake" value={s ? usd(s.atStake) : "…"} accent="orange" icon={Gavel}>
          Open disputes (plus Stripe&apos;s fee).
        </KpiTile>
        <KpiTile label="Win rate" value={s ? pct(s.winRate, 0) : "…"} accent="emerald" icon={Trophy}>
          {s ? `${int(s.won)} won · ${int(s.lost)} lost` : null}
        </KpiTile>
      </div>

      <Section
        title="Disputes"
        actions={
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Email, user id, dp_, ch_…" className={cn(inputClass, "w-60")} />
            <select value={status} onChange={(e) => (setStatus(e.target.value), setPage(1))} className={inputClass}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="">All</option>
            </select>
          </div>
        }
      >
        {list.isError ? (
          <p className="text-sm text-red-300">{(list.error as Error).message}</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-[13px]">
                <thead className="text-[11px] tracking-wide text-white/40 uppercase">
                  <tr className="border-b border-white/[0.06]">
                    <th className="py-2 pr-3 font-medium">Opened</th>
                    <th className="py-2 pr-3 font-medium">Customer</th>
                    <th className="py-2 pr-3 text-right font-medium">Amount</th>
                    <th className="py-2 pr-3 font-medium">Reason</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 font-medium">Evidence due</th>
                    <th className="py-2 font-medium">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {list.isLoading && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-white/40">
                        Loading…
                      </td>
                    </tr>
                  )}
                  {list.data?.data.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-white/40">
                        {status === "open" ? "No open disputes." : "No disputes match."}
                      </td>
                    </tr>
                  )}
                  {list.data?.data.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => router.push(`/admin/billing/disputes/${d.id}`)}
                      className="cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.03]"
                    >
                      <td className="py-2.5 pr-3 whitespace-nowrap text-white/60">{when(d.stripeCreatedAt ?? d.createdAt)}</td>
                      <td className="max-w-[220px] truncate py-2.5 pr-3">
                        <UserLink userId={d.userId} email={d.email} />
                      </td>
                      <td className="py-2.5 pr-3 text-right font-semibold text-white tabular-nums">{money(d.amount, d.currency)}</td>
                      <td className="py-2.5 pr-3 text-white/70">{d.reason ? statusLabel(d.reason) : "—"}</td>
                      <td className="py-2.5 pr-3">
                        <Badge tone={disputeStatusTone(d.status)}>{statusLabel(d.status)}</Badge>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <DueIn due={d.evidenceDueBy} status={d.status} />
                      </td>
                      <td className="py-2.5">
                        {d.evidenceError ? (
                          <Badge tone="red">Failed</Badge>
                        ) : d.stripeDraftAt ? (
                          <Badge tone="green">Sent to Stripe</Badge>
                        ) : d.evidenceBuiltAt ? (
                          <Badge tone="sky">Ready</Badge>
                        ) : (
                          <Badge tone="gray">Gathering…</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {list.data && <Pager page={list.data.page} totalPages={list.data.totalPages} total={list.data.total} onPage={setPage} />}
          </div>
        )}
      </Section>
    </div>
  );
}
