"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  BillingMetrics,
  humanize,
  LapsedCustomer,
  money,
  shortDate,
} from "@/features/admin/users/types/billing";

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "12 months", days: 365 },
];

const card = "rounded-xl border border-white/10 bg-background-light p-4";

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error ?? "Request failed");
  return json as T;
}

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className={card}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", tone)}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function MovementRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-medium tabular-nums",
          value > 0 ? "text-green-400" : value < 0 ? "text-red-400" : "text-muted-foreground",
        )}
      >
        {value > 0 ? "+" : ""}
        {money(value)}
      </span>
    </div>
  );
}

type BackfillStatus = {
  status: string;
  dryRun?: boolean;
  step?: string;
  error?: string;
  placeholderSubscriptions?: number;
  duplicateInvoiceRows?: number;
  stripeSubscriptions?: { seen: number; synced: number; skipped: number; failed: number };
  stripeInvoices?: { seen: number; recorded: number; skipped: number; failed: number };
  users?: { total: number; refreshed: number; failed: number };
};

type ImportStatus = {
  status: string;
  dryRun?: boolean;
  step?: string;
  error?: string;
  placeholderSubscriptions?: number;
  duplicateInvoiceRows?: number;
  legacySubscriptions?: { found: number; imported: number; failed: number; byStatus: Record<string, number> };
  stripe?: {
    reachable: boolean | null;
    reachError?: string;
    synced: number;
    notFound: number;
    earlierSubscriptions: number;
    invoices: number;
    refunds: number;
  };
  invoicesUpdated?: number;
  eventsCreated?: number;
  users?: { total: number; refreshed: number; failed: number };
};

/** Builds the new billing data from the old database records (no Stripe calls). */
function LegacyImportControls() {
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus(await getJson<ImportStatus>("/api/admin/billing/import-legacy"));
    } catch {
      /* not critical */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (status?.status !== "running") return;
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [status?.status, load]);

  const start = async (dryRun: boolean) => {
    if (!dryRun && !confirm("Import the old subscription data into the new billing records?")) return;
    setBusy(true);
    try {
      setStatus(await getJson<ImportStatus>(`/api/admin/billing/import-legacy?dryRun=${dryRun}`, { method: "POST" }));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const subs = status?.legacySubscriptions;
  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Import old data</p>
          <p className="text-xs text-muted-foreground">
            Converts your old STRIPE subscriptions to the new format, filling the real dates, invoices, refunds and
            earlier subscriptions from Stripe (database values are kept when Stripe doesn&apos;t have one). No emails,
            no credit changes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => start(true)}
            disabled={busy || status?.status === "running"}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/5 disabled:opacity-50"
          >
            Import dry run
          </button>
          <button
            onClick={() => start(false)}
            disabled={busy || status?.status === "running"}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            Import old data
          </button>
        </div>
      </div>
      {status && status.status !== "not_started" && (
        <div className="mt-3 rounded-lg bg-black/20 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          <p className="flex items-center gap-2">
            {status.status === "running" && <Loader2 className="size-3 animate-spin" />}
            {status.dryRun ? "Dry run" : "Import"}: {status.status}
            {status.step ? ` (${status.step})` : ""}
            {status.error ? ` — ${status.error}` : ""}
          </p>
          {subs && (
            <p>
              old STRIPE subscriptions: {subs.found} found
              {status.dryRun ? "" : `, ${subs.imported} imported, ${subs.failed} failed`}
              {Object.keys(subs.byStatus).length > 0 &&
                ` (${Object.entries(subs.byStatus)
                  .map(([s, n]) => `${n} ${s}`)
                  .join(", ")})`}
            </p>
          )}
          {status.stripe && status.dryRun && status.stripe.reachable !== null && (
            <p className={status.stripe.reachable ? "text-green-400" : "text-red-400"}>
              Stripe: {status.stripe.reachable ? "connected" : `not reachable — ${status.stripe.reachError ?? "check the API key"}`}
            </p>
          )}
          {status.stripe && !status.dryRun && (
            <p>
              from Stripe: {status.stripe.synced} subscriptions filled ({status.stripe.notFound} not in Stripe, kept
              database values) · {status.stripe.earlierSubscriptions} earlier subscriptions recovered ·{" "}
              {status.stripe.invoices} invoices · {status.stripe.refunds} refunds
            </p>
          )}
          <p>
            invoices {status.dryRun ? "to label" : "labelled"}: {status.invoicesUpdated ?? 0} · history events:{" "}
            {status.eventsCreated ?? 0} · placeholder subs: {status.placeholderSubscriptions ?? 0} · duplicate invoice
            rows: {status.duplicateInvoiceRows ?? 0}
          </p>
          {status.users && !status.dryRun && (
            <p>
              users: {status.users.refreshed}/{status.users.total} summarized, {status.users.failed} failed
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** One-time migration and reconciliation controls. */
function SyncControls() {
  const [status, setStatus] = useState<BackfillStatus | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus(await getJson<BackfillStatus>("/api/admin/billing/backfill"));
    } catch {
      /* not critical */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Poll while the backfill runs.
  useEffect(() => {
    if (status?.status !== "running") return;
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [status?.status, load]);

  const startBackfill = async (dryRun: boolean) => {
    if (!dryRun && !confirm("Run the billing migration for real? Back up the database first.")) return;
    setBusy(true);
    try {
      setStatus(await getJson<BackfillStatus>(`/api/admin/billing/backfill?dryRun=${dryRun}`, { method: "POST" }));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const reconcile = async () => {
    setBusy(true);
    try {
      await getJson("/api/admin/billing/reconcile", { method: "POST" });
      toast.success("Reconciliation started. It runs in the background.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Stripe sync</p>
          <p className="text-xs text-muted-foreground">
            The migration imports every Stripe subscription and invoice into the new history (run once; safe to repeat).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => startBackfill(true)}
            disabled={busy || status?.status === "running"}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/5 disabled:opacity-50"
          >
            Migration dry run
          </button>
          <button
            onClick={() => startBackfill(false)}
            disabled={busy || status?.status === "running"}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            Run migration
          </button>
          <button
            onClick={reconcile}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw className="size-3.5" /> Reconcile now
          </button>
        </div>
      </div>
      {status && status.status !== "not_started" && (
        <div className="mt-3 rounded-lg bg-black/20 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          <p className="flex items-center gap-2">
            {status.status === "running" && <Loader2 className="size-3 animate-spin" />}
            {status.dryRun ? "Dry run" : "Migration"}: {status.status}
            {status.step ? ` (${status.step})` : ""}
            {status.error ? ` — ${status.error}` : ""}
          </p>
          <p>
            placeholder subs: {status.placeholderSubscriptions ?? 0} · duplicate invoice rows:{" "}
            {status.duplicateInvoiceRows ?? 0}
          </p>
          {status.stripeSubscriptions && (
            <p>
              stripe subscriptions: {status.stripeSubscriptions.seen} seen, {status.stripeSubscriptions.synced} synced,{" "}
              {status.stripeSubscriptions.skipped} skipped, {status.stripeSubscriptions.failed} failed
            </p>
          )}
          {status.stripeInvoices && (
            <p>
              stripe invoices: {status.stripeInvoices.seen} seen, {status.stripeInvoices.recorded} recorded,{" "}
              {status.stripeInvoices.failed} failed
            </p>
          )}
          {status.users && (
            <p>
              users: {status.users.refreshed}/{status.users.total} summarized, {status.users.failed} failed
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Admin: subscription metrics from our own billing history. */
export function BillingMetricsPanel() {
  const [days, setDays] = useState(30);
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [lapsed, setLapsed] = useState<{ data: LapsedCustomer[]; totalCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    getJson<BillingMetrics>(`/api/admin/billing/metrics?from=${from.toISOString()}&to=${to.toISOString()}`)
      .then((data) => {
        setMetrics(data);
        setError(null);
      })
      .catch((e) => setError((e as Error).message));
  }, [days]);

  useEffect(() => {
    getJson<{ data: LapsedCustomer[]; totalCount: number }>("/api/admin/billing/lapsed?limit=10")
      .then(setLapsed)
      .catch(() => setLapsed(null));
  }, []);

  const c = metrics?.current;
  const p = metrics?.period;

  return (
    <section className="mb-10 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Revenue &amp; churn</h2>
          <p className="text-muted-foreground text-sm">From the subscription history. MRR is after running coupons, before tax.</p>
        </div>
        <div className="flex rounded-lg border border-white/10 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium",
                days === r.days ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {c && p ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              label="MRR"
              value={money(c.mrr)}
              hint={
                c.listMrr != null && c.listMrr > c.mrr
                  ? `ARR ${money(c.arr)} · ${money(c.listMrr - c.mrr)} off with coupons (${c.discountedCustomers ?? 0} customers)`
                  : `ARR ${money(c.arr)}`
              }
            />
            <Kpi
              label="Paying customers"
              value={String(c.payingCustomers)}
              hint={`${c.canceling} canceling · ${c.pastDue} past due · ${c.trialing} trialing`}
            />
            <Kpi
              label="Customer churn"
              value={`${(p.customerChurnRate * 100).toFixed(1)}%`}
              hint={`${p.churned} ended: ${p.churnedVoluntary} canceled, ${p.churnedPaymentFailed} payment failed`}
              tone={p.customerChurnRate > 0.08 ? "text-red-400" : undefined}
            />
            <Kpi
              label="Net revenue"
              value={money(p.revenue.net)}
              hint={`${p.revenue.invoices} invoices · ${money(p.revenue.refunded)} refunded`}
            />
            <Kpi label="ARPU" value={money(c.arpu)} hint="Per paying customer / month" />
            <Kpi label="Avg. lifetime value" value={money(c.averageLifetimeValue)} hint={`${c.everPaid} customers ever paid`} />
            <Kpi label="Lapsed payers" value={String(c.lapsed)} hint="Paid before, not paying now" tone="text-amber-300" />
            <Kpi
              label="Failed payments"
              value={String(p.paymentFailures)}
              hint={`${p.paymentRecoveries} recovered · ${p.disputes} disputes`}
              tone={p.disputes > 0 ? "text-red-400" : undefined}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className={card}>
              <p className="mb-2 text-sm font-semibold">MRR movement</p>
              <MovementRow label="New" value={p.mrrMovement.new} />
              <MovementRow label="Reactivation" value={p.mrrMovement.reactivation} />
              <MovementRow label="Expansion (upgrades)" value={p.mrrMovement.expansion} />
              <MovementRow label="Contraction (downgrades)" value={p.mrrMovement.contraction} />
              <MovementRow label="Churn" value={p.mrrMovement.churn} />
              <div className="mt-1 border-t border-white/10 pt-1">
                <MovementRow label="Net change" value={p.mrrMovement.net} />
              </div>
            </div>

            <div className={card}>
              <p className="mb-2 text-sm font-semibold">Lifecycle</p>
              {[
                ["New subscribers", p.newSubscribers],
                ["Came back", p.reactivated],
                ["Upgrades", p.upgrades],
                ["Downgrades", p.downgrades],
                ["Cancels scheduled", p.cancelsScheduled],
                ["Cancels undone", p.cancelsUndone],
                ["Refunds", p.refunds],
                ["Credit packs sold", `${p.creditPacks?.count ?? 0} · ${money(p.creditPacks?.revenue ?? 0)}`],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between py-1.5 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium tabular-nums">{value}</span>
                </div>
              ))}
            </div>

            <div className={card}>
              <p className="mb-2 text-sm font-semibold">Plan mix</p>
              {c.planMix.length === 0 ? (
                <p className="text-sm text-muted-foreground">No paying customers.</p>
              ) : (
                c.planMix.map((plan) => (
                  <div key={plan.planName} className="flex justify-between py-1.5 text-sm">
                    <span className="text-muted-foreground">
                      {plan.planName} <span className="text-[11px]">({plan.customers})</span>
                    </span>
                    <span className="font-medium tabular-nums">{money(plan.mrr)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        !error && <div className="h-40 animate-pulse rounded-xl bg-white/5" />
      )}

      <div className={card}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">
            Lapsed payers <span className="font-normal text-muted-foreground">({lapsed?.totalCount ?? 0})</span>
          </p>
          <Link href="/admin/users?billing=lapsed" className="text-xs text-primary hover:underline">
            See all
          </Link>
        </div>
        {!lapsed?.data.length ? (
          <p className="text-sm text-muted-foreground">Nobody yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Last plan</th>
                  <th className="pb-2 font-medium">Paid</th>
                  <th className="pb-2 font-medium">Stopped</th>
                  <th className="pb-2 font-medium">Why</th>
                </tr>
              </thead>
              <tbody>
                {lapsed.data.map((u) => (
                  <tr key={u.userId} className="border-t border-white/5">
                    <td className="py-2">
                      <Link href={`/admin/users/${u.userId}`} className="hover:underline">
                        {u.email ?? u.userId}
                      </Link>
                    </td>
                    <td className="py-2 text-muted-foreground">{u.planName ?? "—"}</td>
                    <td className="py-2 tabular-nums">{money(u.lifetimeValue)}</td>
                    <td className="py-2 text-muted-foreground">{shortDate(u.churnedAt)}</td>
                    <td className="py-2 text-muted-foreground capitalize">{humanize(u.churnReason) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LegacyImportControls />
      <SyncControls />
    </section>
  );
}
