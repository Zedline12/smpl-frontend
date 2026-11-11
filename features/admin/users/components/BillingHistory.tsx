import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminUserBilling, humanize, money, shortDate, UserCouponRedemption } from "../types/billing";
import { ResyncBillingButton } from "./ResyncBillingButton";
import { RedemptionOutcome } from "@/features/admin/discounts/components/RedemptionOutcome";

/** Colour per timeline event: green = money in, red = money out / risk, amber = warning. */
const EVENT_STYLE: Record<string, { label: string; dot: string }> = {
  trial_started: { label: "Trial started", dot: "bg-sky-400" },
  started: { label: "Subscribed", dot: "bg-green-400" },
  reactivated: { label: "Came back", dot: "bg-green-400" },
  activated: { label: "Trial converted", dot: "bg-green-400" },
  upgraded: { label: "Upgraded", dot: "bg-green-400" },
  downgraded: { label: "Downgraded", dot: "bg-amber-400" },
  renewed: { label: "Renewed", dot: "bg-green-500/70" },
  payment_failed: { label: "Payment failed", dot: "bg-red-400" },
  payment_recovered: { label: "Payment recovered", dot: "bg-green-400" },
  cancel_scheduled: { label: "Canceled (ends at period end)", dot: "bg-amber-400" },
  cancel_undone: { label: "Cancel undone", dot: "bg-green-400" },
  paused: { label: "Paused", dot: "bg-amber-400" },
  resumed: { label: "Resumed", dot: "bg-green-400" },
  ended: { label: "Subscription ended", dot: "bg-red-500" },
  refunded: { label: "Refunded", dot: "bg-red-400" },
  disputed: { label: "Payment disputed", dot: "bg-red-600" },
  credits_purchased: { label: "Bought a credit pack", dot: "bg-amber-400" },
  discount_applied: { label: "Coupon applied", dot: "bg-emerald-400" },
  discount_ended: { label: "Coupon ended", dot: "bg-emerald-700" },
};

/** "while on SUMMER25" / "12 days after SUMMER25 ended" for cancel and end events. */
function couponContext(meta: AdminUserBilling["events"][number]["metadata"]): string | null {
  if (!meta?.hadCoupon) return null;
  const code = meta.couponCode ?? "a coupon";
  if (meta.discountActive) return `while on ${code}`;
  if (meta.daysSinceDiscountEnded != null) return `${meta.daysSinceDiscountEnded} days after ${code} ended`;
  return `had used ${code}`;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-900/40 text-green-300 border-green-700/40",
  trialing: "bg-sky-900/40 text-sky-300 border-sky-700/40",
  past_due: "bg-yellow-900/40 text-yellow-300 border-yellow-700/40",
  canceling: "bg-amber-900/40 text-amber-300 border-amber-700/40",
  canceled: "bg-red-900/40 text-red-300 border-red-700/40",
  unpaid: "bg-red-900/40 text-red-300 border-red-700/40",
};

const panel = "rounded-xl border border-white/[0.07] bg-[oklch(0.13_0_0)]";

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className={cn(panel, "px-4 py-3")}>
      <p className={cn("text-base font-semibold tabular-nums", tone ?? "text-white/90")}>{value}</p>
      <p className="mt-0.5 text-[11px] text-white/40">{label}</p>
    </div>
  );
}

function eventDetail(e: AdminUserBilling["events"][number]): string {
  const parts: string[] = [];
  if (e.type === "upgraded" || e.type === "downgraded") parts.push(`${e.fromPlanName ?? "?"} → ${e.toPlanName ?? "?"}`);
  else if (e.toPlanName && ["started", "reactivated", "activated", "renewed", "ended", "cancel_scheduled"].includes(e.type)) parts.push(e.toPlanName);
  if (e.type === "credits_purchased" && e.metadata?.packName) {
    parts.push(`${e.metadata.packName} · ${Number(e.metadata.credits ?? 0).toLocaleString("en-US")} credits`);
  }
  if (e.amount) parts.push(money(e.amount, e.currency ?? "usd"));
  const reason = e.metadata?.feedback ?? e.metadata?.reason;
  if (reason && (e.type === "ended" || e.type === "cancel_scheduled")) parts.push(humanize(reason));
  if (e.metadata?.by && (e.type === "ended" || e.type === "cancel_scheduled")) parts.push(`by ${humanize(e.metadata.by)}`);
  if (e.type === "payment_failed" && e.metadata?.attempt) parts.push(`attempt ${e.metadata.attempt}`);
  if (e.type === "discount_applied") {
    const m = e.metadata ?? {};
    const off = m.percentOff != null ? `${m.percentOff}% off` : m.amountOff ? `${money(m.amountOff)} off` : null;
    const length =
      m.duration === "repeating" ? `for ${m.durationInMonths} months` : m.duration === "once" ? "first payment" : m.duration;
    parts.push([m.code ?? m.couponName, off, length].filter(Boolean).join(" · "));
    if (m.appliedVia && m.appliedVia !== "unknown") parts.push(`via ${humanize(m.appliedVia)}`);
  }
  if (e.type === "discount_ended") {
    const m = e.metadata ?? {};
    parts.push([m.code, humanize(m.reason)].filter(Boolean).join(" · "));
    if (m.totalDiscounted) parts.push(`saved ${money(m.totalDiscounted)} over ${m.discountedInvoiceCount} invoices`);
  }
  if (e.type === "renewed" && e.metadata?.discountAmount) {
    parts.push(`−${money(e.metadata.discountAmount)}${e.metadata.code ? ` with ${e.metadata.code}` : ""}`);
  }
  if (e.type === "ended" || e.type === "cancel_scheduled") {
    const context = couponContext(e.metadata);
    if (context) parts.push(context);
  }
  if (e.metadata?.comment) parts.push(`“${e.metadata.comment}”`);
  return parts.join(" · ");
}

/** Coupons this user redeemed, and month by month which invoices were discounted. */
function CouponsPanel({ billing, currency }: { billing: AdminUserBilling; currency: string }) {
  const s = billing.summary;
  const coupons: UserCouponRedemption[] = billing.coupons ?? [];
  const discounted = billing.invoices.filter((i) => (i.discountAmount ?? 0) > 0);
  if (!coupons.length && !discounted.length) return null;

  return (
    <div className={cn(panel, "p-5")}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h3 className="mr-2 text-sm font-semibold text-white/80">Coupons &amp; discounts</h3>
        {s?.acquiredWithCoupon && (
          <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300">
            Acquired with {s.firstCouponCode ?? "a coupon"}
          </span>
        )}
        {s?.discountedNow && (
          <span className="rounded-full bg-sky-400/10 px-2 py-0.5 text-[11px] text-sky-300">Discounted now</span>
        )}
        {!!s?.totalDiscounted && (
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/60">
            Saved {money(s.totalDiscounted, currency)} in total
          </span>
        )}
        {s?.listMrr != null && s.listMrr !== s.mrr && (
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/60">
            MRR {money(s.mrr, currency)} of {money(s.listMrr, currency)} list
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          {coupons.map((r) => (
            <div key={r.id} className="rounded-lg border border-white/[0.06] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {r.couponId ? (
                    <Link
                      href={`/admin/discounts/${r.couponId}`}
                      className="font-mono text-sm font-semibold text-white/90 hover:underline"
                    >
                      {r.code ?? "No code"}
                    </Link>
                  ) : (
                    <span className="font-mono text-sm font-semibold text-white/90">{r.code ?? "No code"}</span>
                  )}
                  {r.isNewCustomer && <span className="text-[10px] uppercase text-emerald-300">new customer</span>}
                </div>
                <span className="text-[11px] text-white/40">{humanize(r.appliedVia)}</span>
              </div>
              <p className="mt-1 text-xs text-white/45">
                {r.planName ?? "Unknown plan"} · from {shortDate(r.start)}
                {r.status === "active"
                  ? r.scheduledEnd
                    ? ` until ${shortDate(r.scheduledEnd)}`
                    : " (no end date)"
                  : ` to ${shortDate(r.endedAt)}`}
                {" · "}
                {r.discountedInvoiceCount} invoice{r.discountedInvoiceCount === 1 ? "" : "s"}, saved{" "}
                {money(r.totalDiscounted, currency)}
              </p>
              <div className="mt-1.5">
                <RedemptionOutcome redemption={r} />
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-white/50">Discounted invoices</p>
          {discounted.length === 0 ? (
            <p className="text-sm text-white/35">None yet.</p>
          ) : (
            <div className="divide-y divide-white/[0.05] rounded-lg border border-white/[0.06]">
              {discounted.map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-3 px-4 py-2 text-xs">
                  <span className="text-white/60">
                    {new Date(i.paidAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    <span className="ml-2 text-white/35">{humanize(i.billingReason)}</span>
                  </span>
                  <span className="tabular-nums text-white/80">
                    {money(i.amount, i.currency)}{" "}
                    <span className="text-emerald-300/90">
                      −{money(i.discountAmount ?? 0, i.currency)}
                      {i.discounts?.find((d) => d.code)?.code ? ` · ${i.discounts.find((d) => d.code)!.code}` : ""}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Admin: everything that ever happened to a user's billing. */
export function BillingHistory({ userId, billing }: { userId: string; billing: AdminUserBilling | null }) {
  if (!billing) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Billing history</h2>
          <ResyncBillingButton userId={userId} />
        </div>
        <p className="text-sm text-white/40">Failed to load billing history.</p>
      </section>
    );
  }
  const s = billing.summary;
  const currency = s?.currency ?? "usd";

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Billing history</h2>
        <ResyncBillingButton userId={userId} />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label="Status"
          value={s ? humanize(s.status) : "free"}
          tone={s?.isPaying ? "text-green-300" : s?.everPaid ? "text-amber-300" : undefined}
        />
        <Stat label="Lifetime value" value={money(s?.lifetimeValue, currency)} />
        <Stat label="MRR" value={money(s?.mrr, currency)} />
        <Stat label="Paid invoices" value={String(s?.paidInvoiceCount ?? 0)} />
        <Stat label="First paid" value={shortDate(s?.firstPaidAt)} />
        <Stat label="Last paid" value={shortDate(s?.lastPaidAt)} />
        <Stat
          label="Stopped paying"
          value={s?.churnedAt ? shortDate(s.churnedAt) : s?.everPaid ? "Still paying" : "Never paid"}
          tone={s?.churnedAt ? "text-red-300" : undefined}
        />
        <Stat label="Why" value={s?.churnReason ? humanize(s.churnReason) : "—"} />
      </div>

      <CouponsPanel billing={billing} currency={currency} />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Timeline */}
        <div className={cn(panel, "p-5")}>
          <h3 className="mb-4 text-sm font-semibold text-white/80">Timeline</h3>
          {billing.events.length === 0 ? (
            <p className="text-sm text-white/35">No subscription activity yet.</p>
          ) : (
            <ol className="relative max-h-[420px] space-y-4 overflow-y-auto border-l border-white/10 pl-5">
              {billing.events.map((e) => {
                const style = EVENT_STYLE[e.type] ?? { label: humanize(e.type), dot: "bg-white/40" };
                const detail = eventDetail(e);
                return (
                  <li key={e.id} className="relative">
                    <span className={cn("absolute top-1.5 -left-[25px] size-2.5 rounded-full ring-4 ring-[oklch(0.13_0_0)]", style.dot)} />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="text-sm font-medium text-white/85">{style.label}</p>
                      <p className="text-[11px] text-white/35 tabular-nums">{shortDate(e.occurredAt)}</p>
                    </div>
                    {detail && <p className="mt-0.5 text-xs text-white/45">{detail}</p>}
                    {e.actor !== "stripe" && <p className="mt-0.5 text-[10px] text-white/30 uppercase">via {e.actor}</p>}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Subscriptions */}
        <div className={cn(panel, "p-5")}>
          <h3 className="mb-4 text-sm font-semibold text-white/80">
            Subscriptions <span className="font-normal text-white/35">({billing.subscriptions.length})</span>
          </h3>
          {billing.subscriptions.length === 0 ? (
            <p className="text-sm text-white/35">Never subscribed.</p>
          ) : (
            <div className="space-y-2">
              {billing.subscriptions.map((sub) => {
                const shown = sub.cancelAtPeriodEnd && sub.status === "active" ? "canceling" : sub.status;
                return (
                  <div key={sub.id} className="rounded-lg border border-white/[0.06] px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white/85">{sub.planName ?? "Unknown plan"}</span>
                        {sub.isCurrent && <span className="text-[10px] text-green-300 uppercase">current</span>}
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px] capitalize",
                          STATUS_STYLES[shown] ?? "border-neutral-700 bg-neutral-800 text-neutral-400",
                        )}
                      >
                        {humanize(shown)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/40">
                      {sub.amount != null && `${money(sub.amount, sub.currency ?? "usd")}/${sub.interval ?? "month"} · `}
                      Started {shortDate(sub.startedAt)}
                      {sub.endedAt
                        ? ` · Ended ${shortDate(sub.endedAt)}`
                        : sub.cancelAtPeriodEnd
                          ? ` · Ends ${shortDate(sub.currentPeriodEnd)}`
                          : ` · Renews ${shortDate(sub.currentPeriodEnd)}`}
                    </p>
                    {sub.cancellation?.by && (
                      <p className="mt-0.5 text-xs text-white/35">
                        Canceled by {humanize(sub.cancellation.by)}
                        {sub.cancellation.feedback || sub.cancellation.reason
                          ? ` · ${humanize(sub.cancellation.feedback ?? sub.cancellation.reason)}`
                          : ""}
                        {sub.cancellation.comment ? ` · “${sub.cancellation.comment}”` : ""}
                      </p>
                    )}
                    <a
                      href={`https://dashboard.stripe.com/subscriptions/${sub.providerSubscriptionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-[11px] text-[#a3a0ff] hover:underline"
                    >
                      {sub.providerSubscriptionId}
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
