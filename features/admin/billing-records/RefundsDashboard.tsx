"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, HandCoins, RotateCcw, ShieldAlert, UserCog } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { KpiTile } from "@/features/admin/components/data-viz/kpi";
import { int, usd } from "@/features/admin/components/data-viz/format";
import { cn } from "@/lib/utils";
import {
  Badge,
  billingApi,
  Facts,
  inputClass,
  money,
  Pager,
  Paged,
  Section,
  StripeId,
  Timeline,
  TimelineEntry,
  Tone,
  UserLink,
  when,
} from "./shared";

type Kind = "self_service" | "early_fraud_warning" | "admin" | "support" | "external";
type Status = "pending" | "succeeded" | "failed" | "canceled" | "requires_action";

export interface RefundRow {
  id: string;
  userId: string | null;
  email: string | null;
  kind: Kind;
  initiatedBy: { kind: string; userId?: string | null };
  reason: string;
  feedback: string | null;
  comment: string | null;
  amount: number;
  currency: string;
  invoiceAmount: number | null;
  amountRefundedBefore: number;
  stripeRefundId: string | null;
  stripeChargeId: string | null;
  stripePaymentIntentId: string | null;
  stripeInvoiceId: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeEventIds: string[];
  planName: string | null;
  status: Status;
  failureReason: string | null;
  requestedAt: string;
  succeededAt: string | null;
  failedAt: string | null;
  subscriptionCanceled: boolean;
  planCreditsRemoved: boolean;
  accountSuspended: boolean;
  emailSent: boolean;
  eligibility: { anchorAt: string; daysSincePayment: number; netCreditsUsed: number; windowDays: number } | null;
  earlyFraudWarning: { id: string; fraudType: string | null; actionable: boolean | null } | null;
  idempotencyKey: string;
  timeline: TimelineEntry[];
}

interface Stats {
  days: number;
  refunds: number;
  amount: number;
  selfService: number;
  selfServiceAmount: number;
  fraudWarnings: number;
  fraudAmount: number;
  adminSupport: number;
  external: number;
  pending: number;
  failed: number;
}

export const KIND_LABEL: Record<Kind, string> = {
  self_service: "Self-service",
  early_fraud_warning: "Fraud warning",
  admin: "Admin",
  support: "Support",
  external: "Stripe dashboard",
};
const KIND_TONE: Record<Kind, Tone> = {
  self_service: "sky",
  early_fraud_warning: "red",
  admin: "violet",
  support: "violet",
  external: "gray",
};
export const STATUS_TONE: Record<Status, Tone> = {
  pending: "amber",
  requires_action: "amber",
  succeeded: "green",
  failed: "red",
  canceled: "gray",
};
const FEEDBACK: Record<string, string> = {
  too_expensive: "Too expensive",
  unused: "Doesn't use it enough",
  missing_features: "Missing features",
  low_quality: "Results not good enough",
  switched_service: "Switching service",
  too_complex: "Too hard to use",
  customer_service: "Support didn't help",
  other: "Something else",
};
const PERIODS = [7, 30, 90, 365];

/** Admin → Billing → Refunds: every refund, who made it, why, and what else happened. */
export function RefundsDashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const [days, setDays] = useState(30);
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const openId = params.get("id");

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(q.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const stats = useQuery({ queryKey: ["admin-refund-stats", days], queryFn: () => billingApi<Stats>(`/refunds/stats?days=${days}`) });
  const query = new URLSearchParams({ page: String(page), limit: "25", ...(kind ? { kind } : {}), ...(status ? { status } : {}), ...(search ? { q: search } : {}) });
  const list = useQuery({
    queryKey: ["admin-refunds", query.toString()],
    queryFn: () => billingApi<Paged<RefundRow>>(`/refunds?${query}`),
  });
  const s = stats.data;

  const open = (id: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (id) next.set("id", id);
    else next.delete("id");
    router.replace(`?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <RotateCcw className="size-6 text-sky-400" /> Refunds
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/50">
            Every refund: users&apos; own &ldquo;cancel and refund&rdquo;, automatic refunds on Stripe fraud warnings, admin and support
            refunds, and refunds made in the Stripe dashboard.
          </p>
        </div>
        <div className="flex rounded-xl border border-white/[0.08] bg-[#161616] p-1">
          {PERIODS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={cn(
                "h-8 rounded-lg px-3.5 text-[13px] font-semibold transition-colors",
                days === d ? "bg-white/[0.1] text-white" : "text-white/50 hover:text-white",
              )}
            >
              {d === 365 ? "Year" : `${d} days`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiTile label="Refunded" value={s ? usd(s.amount) : "…"} accent="blue" icon={HandCoins}>
          {s ? `${int(s.refunds)} refunds in ${s.days} days` : null}
        </KpiTile>
        <KpiTile label="Self-service" value={s ? int(s.selfService) : "…"} accent="sky" icon={RotateCcw}>
          {s ? `${usd(s.selfServiceAmount)} · no credits used` : null}
        </KpiTile>
        <KpiTile label="Fraud warnings" value={s ? int(s.fraudWarnings) : "…"} accent="red" icon={ShieldAlert}>
          {s ? `${usd(s.fraudAmount)} refunded, accounts suspended` : null}
        </KpiTile>
        <KpiTile label="Admin, support & Stripe" value={s ? int(s.adminSupport + s.external) : "…"} accent="violet" icon={UserCog}>
          {s ? `${int(s.adminSupport)} admin/support · ${int(s.external)} in Stripe` : null}
        </KpiTile>
        <KpiTile label="Pending / failed" value={s ? `${int(s.pending)} / ${int(s.failed)}` : "…"} accent={s?.failed ? "orange" : "emerald"} icon={s?.failed ? AlertTriangle : Clock}>
          {s?.failed ? "Failed refunds never reached the customer." : "All refunds went through."}
        </KpiTile>
      </div>

      <Section
        title="All refunds"
        actions={
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Email, user id, re_, ch_, in_…" className={cn(inputClass, "w-64")} />
            <select value={kind} onChange={(e) => (setKind(e.target.value), setPage(1))} className={inputClass}>
              <option value="">All kinds</option>
              {Object.entries(KIND_LABEL).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
            <select value={status} onChange={(e) => (setStatus(e.target.value), setPage(1))} className={inputClass}>
              <option value="">All statuses</option>
              {Object.keys(STATUS_TONE).map((k) => (
                <option key={k} value={k}>
                  {k.replace("_", " ")}
                </option>
              ))}
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
                    <th className="py-2 pr-3 font-medium">Date</th>
                    <th className="py-2 pr-3 font-medium">Customer</th>
                    <th className="py-2 pr-3 font-medium">Kind</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 text-right font-medium">Amount</th>
                    <th className="py-2 pr-3 font-medium">Plan</th>
                    <th className="py-2 font-medium">Why</th>
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
                        No refunds match.
                      </td>
                    </tr>
                  )}
                  {list.data?.data.map((r) => (
                    <tr key={r.id} onClick={() => open(r.id)} className="cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.03]">
                      <td className="py-2.5 pr-3 whitespace-nowrap text-white/60">{when(r.requestedAt)}</td>
                      <td className="max-w-[220px] truncate py-2.5 pr-3">
                        <UserLink userId={r.userId} email={r.email} />
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge tone={KIND_TONE[r.kind]}>{KIND_LABEL[r.kind]}</Badge>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge tone={STATUS_TONE[r.status]}>{r.status.replace("_", " ")}</Badge>
                      </td>
                      <td className="py-2.5 pr-3 text-right font-semibold text-white tabular-nums">{money(r.amount, r.currency)}</td>
                      <td className="py-2.5 pr-3 text-white/60">{r.planName ?? "—"}</td>
                      <td className="max-w-[240px] truncate py-2.5 text-white/60">
                        {r.earlyFraudWarning?.fraudType?.replaceAll("_", " ") ?? (r.feedback ? FEEDBACK[r.feedback] ?? r.feedback : r.reason.replaceAll("_", " "))}
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

      <RefundDetail id={openId} onClose={() => open(null)} />
    </div>
  );
}

function RefundDetail({ id, onClose }: { id: string | null; onClose: () => void }) {
  const detail = useQuery({ queryKey: ["admin-refund", id], queryFn: () => billingApi<RefundRow>(`/refunds/${id}`), enabled: !!id });
  const r = detail.data;
  const yes = (v: boolean) => (v ? "Yes" : "No");

  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111]">
        <DialogTitle className="text-white">
          {r ? `${money(r.amount, r.currency)} refund · ${KIND_LABEL[r.kind]}` : "Refund"}
        </DialogTitle>
        <DialogDescription className="text-white/50">
          {r ? `Requested ${when(r.requestedAt)}${r.succeededAt ? ` · refunded ${when(r.succeededAt)}` : ""}` : detail.isError ? (detail.error as Error).message : "Loading…"}
        </DialogDescription>
        {r && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge tone={STATUS_TONE[r.status]}>{r.status.replace("_", " ")}</Badge>
              {r.subscriptionCanceled && <Badge tone="gray">Subscription ended</Badge>}
              {r.planCreditsRemoved && <Badge tone="gray">Plan credits removed</Badge>}
              {r.accountSuspended && <Badge tone="red">Account suspended</Badge>}
              {r.emailSent && <Badge tone="sky">Customer emailed</Badge>}
            </div>
            {r.failureReason && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-200">{r.failureReason}</p>}
            <Facts
              rows={[
                ["Customer", <UserLink key="u" userId={r.userId} email={r.email} />],
                [
                  "Initiated by",
                  r.initiatedBy?.userId ? (
                    <span key="by">
                      {r.initiatedBy.kind === "user" ? "The customer" : "Admin"} ·{" "}
                      <UserLink userId={r.initiatedBy.userId} email={null} />
                    </span>
                  ) : (
                    ({ stripe: "Stripe", system: "System", admin: "Admin", user: "The customer" } as Record<string, string>)[r.initiatedBy?.kind] ?? "—"
                  ),
                ],
                ["Reason", r.reason.replaceAll("_", " ")],
                ["Customer's reason", r.feedback ? FEEDBACK[r.feedback] ?? r.feedback : "—"],
                ["Comment", r.comment ?? "—"],
                ["Plan", r.planName ?? "—"],
                ["Refunded", money(r.amount, r.currency)],
                ["Payment", r.invoiceAmount != null ? `${money(r.invoiceAmount, r.currency)}${r.amountRefundedBefore ? ` (${money(r.amountRefundedBefore, r.currency)} refunded before)` : ""}` : "—"],
                ...(r.eligibility
                  ? ([
                      ["Paid", when(r.eligibility.anchorAt)],
                      ["Days since payment", `${r.eligibility.daysSincePayment} of ${r.eligibility.windowDays}`],
                      ["Credits used since", int(r.eligibility.netCreditsUsed)],
                    ] as [string, React.ReactNode][])
                  : []),
                ...(r.earlyFraudWarning
                  ? ([
                      ["Fraud type", r.earlyFraudWarning.fraudType?.replaceAll("_", " ") ?? "—"],
                      ["Warning", <StripeId key="w" id={r.earlyFraudWarning.id} />],
                      ["Actionable", r.earlyFraudWarning.actionable == null ? "—" : yes(r.earlyFraudWarning.actionable)],
                    ] as [string, React.ReactNode][])
                  : []),
              ]}
            />
            <div>
              <h3 className="mb-3 text-[12px] font-semibold tracking-wide text-white/50 uppercase">Stripe</h3>
              <Facts
                rows={[
                  ["Refund", <StripeId key="r" id={r.stripeRefundId} />],
                  ["Charge", <StripeId key="c" id={r.stripeChargeId} />],
                  ["Payment intent", <StripeId key="p" id={r.stripePaymentIntentId} />],
                  ["Invoice", <StripeId key="i" id={r.stripeInvoiceId} />],
                  ["Customer", <StripeId key="cu" id={r.stripeCustomerId} />],
                  ["Subscription", <StripeId key="s" id={r.stripeSubscriptionId} />],
                  ["Events", r.stripeEventIds?.length ? r.stripeEventIds.join(", ") : "—"],
                  ["Idempotency key", <span key="k" className="font-mono text-[12px]">{r.idempotencyKey}</span>],
                ]}
              />
            </div>
            <div>
              <h3 className="mb-3 text-[12px] font-semibold tracking-wide text-white/50 uppercase">Timeline</h3>
              <Timeline items={r.timeline} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
