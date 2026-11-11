"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { humanize, money, shortDate } from "@/features/admin/users/types/billing";
import { adminJson, CancelCategory, CohortRetention, CouponStats, DiscountAnalytics, pct } from "../types";

const RANGES = [
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "6 months", days: 182 },
  { label: "12 months", days: 365 },
];
const WINDOWS = [14, 35, 60];

/** Categorical slots (dark steps, validated on the admin surface), fixed order. */
const SERIES = { s1: "#3987e5", s2: "#d95926", s3: "#199e70", s4: "#c98500" };

const card = "rounded-xl border border-white/10 bg-background-light p-4";

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={card}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Swatch({ color }: { color: string }) {
  return <span className="inline-block size-2.5 shrink-0 rounded-[3px]" style={{ background: color }} />;
}

/** New subscribers per month, with vs without a coupon (stacked columns, hover for numbers). */
function AcquisitionChart({ monthly }: { monthly: DiscountAnalytics["monthly"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...monthly.map((m) => m.newWithCoupon + m.newWithoutCoupon));
  const step = max <= 5 ? 1 : max <= 10 ? 2 : Math.ceil(max / 4 / 5) * 5;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.floor(top / step) + 1 }, (_, i) => i * step);
  const H = 160;
  const label = (month: string) =>
    new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });

  return (
    <div className={card}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">New subscribers per month</p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Swatch color={SERIES.s1} /> With a coupon
          </span>
          <span className="flex items-center gap-1.5">
            <Swatch color={SERIES.s2} /> Without
          </span>
        </div>
      </div>
      <div className="relative flex gap-2">
        <div className="relative w-6 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground" style={{ height: H }}>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: H - (t / top) * H }}>
              {t}
            </span>
          ))}
        </div>
        <div className="relative flex-1" style={{ height: H }}>
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 h-px bg-white/[0.06]" style={{ top: H - (t / top) * H }} />
          ))}
          <div className="absolute inset-0 flex items-end justify-around">
            {monthly.map((m, i) => {
              const withH = (m.newWithCoupon / top) * H;
              const withoutH = (m.newWithoutCoupon / top) * H;
              return (
                <div
                  key={m.month}
                  className="relative flex h-full flex-1 cursor-default flex-col items-center justify-end"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  {hover === i && (
                    <div className="pointer-events-none absolute bottom-full z-10 mb-1 w-max rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-[11px] shadow-lg">
                      <p className="mb-1 font-semibold text-foreground">{label(m.month)} {m.month.slice(0, 4)}</p>
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <Swatch color={SERIES.s1} /> With a coupon <span className="ml-auto pl-3 tabular-nums text-foreground">{m.newWithCoupon}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <Swatch color={SERIES.s2} /> Without <span className="ml-auto pl-3 tabular-nums text-foreground">{m.newWithoutCoupon}</span>
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Redemptions {m.redemptions} · given {money(m.discountGiven)}
                      </p>
                    </div>
                  )}
                  <div className={cn("flex w-full max-w-6 flex-col justify-end", hover !== null && hover !== i && "opacity-60")}>
                    {/* Top segment gets the rounded data-end; a 2px surface gap separates the two. */}
                    {m.newWithoutCoupon > 0 && (
                      <div
                        className="w-full rounded-t-[4px]"
                        style={{ height: withoutH, background: SERIES.s2, marginBottom: m.newWithCoupon > 0 ? 2 : 0 }}
                      />
                    )}
                    {m.newWithCoupon > 0 && (
                      <div
                        className={cn("w-full", m.newWithoutCoupon === 0 && "rounded-t-[4px]")}
                        style={{ height: withH, background: SERIES.s1 }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="ml-8 mt-1.5 flex justify-around text-[10px] text-muted-foreground">
        {monthly.map((m) => (
          <span key={m.month} className="flex-1 text-center">
            {label(m.month)}
          </span>
        ))}
      </div>
    </div>
  );
}

const CANCEL_PARTS: { key: CancelCategory; label: string; color: string }[] = [
  { key: "while_discounted", label: "While discounted", color: SERIES.s1 },
  { key: "within_window", label: "Soon after the discount", color: SERIES.s2 },
  { key: "after_window", label: "Long after a coupon", color: SERIES.s3 },
  { key: "never_discounted", label: "Never had a coupon", color: SERIES.s4 },
];

/** Cancellations in the range, split by the coupon situation when the user asked. */
function CancellationSplit({ data }: { data: DiscountAnalytics }) {
  const c = data.cancellations;
  const values: Record<CancelCategory, number> = {
    while_discounted: c.whileDiscounted,
    within_window: c.withinWindow,
    after_window: c.afterWindow,
    never_discounted: c.neverDiscounted,
  };
  const describe = CANCEL_PARTS.map((p) => `${p.label}: ${values[p.key]}`).join(", ");
  return (
    <div className={card}>
      <p className="text-sm font-semibold">Cancellations ({c.total})</p>
      <p className="mb-3 text-xs text-muted-foreground">
        &ldquo;Soon after&rdquo; = within {data.windowDays} days of the discount ending.
      </p>
      {c.total === 0 ? (
        <p className="text-sm text-muted-foreground">No cancellations in this range.</p>
      ) : (
        <div className="flex h-7 w-full gap-[2px]" role="img" aria-label={`Cancellations: ${describe}`}>
          {CANCEL_PARTS.filter((p) => values[p.key] > 0).map((p) => {
            const share = values[p.key] / c.total;
            return (
              <div
                key={p.key}
                title={`${p.label}: ${values[p.key]} (${pct(share)})`}
                className="flex h-full items-center rounded-[4px] px-2 text-[11px] font-semibold"
                style={{
                  width: `${share * 100}%`,
                  background: p.color,
                  color: p.color === SERIES.s4 ? "#0b0b0b" : "#ffffff",
                }}
              >
                {share >= 0.12 ? pct(share) : ""}
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-3 space-y-1.5">
        {CANCEL_PARTS.map((p) => (
          <div key={p.key} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Swatch color={p.color} /> {p.label}
            </span>
            <span className="tabular-nums text-foreground">{values[p.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RetentionTable({ data }: { data: DiscountAnalytics["retention"] }) {
  const rows: { label: string; get: (r: CohortRetention) => string }[] = [
    { label: "Customers", get: (r) => String(r.customers) },
    { label: "Still paying", get: (r) => `${pct(r.stillPayingRate)} (${r.stillPaying})` },
    { label: "Renewed at least once", get: (r) => `${pct(r.renewedRate)} (${r.renewed})` },
    { label: "Paid a full-price invoice", get: (r) => `${pct(r.customers ? r.paidFullPrice / r.customers : 0)} (${r.paidFullPrice})` },
    { label: "Revenue per customer", get: (r) => money(r.averageRevenue) },
  ];
  return (
    <div className={card}>
      <p className="text-sm font-semibold">Do coupon customers stay?</p>
      <p className="mb-3 text-xs text-muted-foreground">Customers whose first payment was in this range.</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th className="pb-2 text-left font-normal" />
            <th className="pb-2 text-right font-normal">
              <span className="inline-flex items-center gap-1.5">
                <Swatch color={SERIES.s1} /> With coupon
              </span>
            </th>
            <th className="pb-2 text-right font-normal">
              <span className="inline-flex items-center gap-1.5">
                <Swatch color={SERIES.s2} /> Without
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="py-1.5 text-muted-foreground">{row.label}</td>
              <td className="py-1.5 text-right tabular-nums">{row.get(data.withCoupon)}</td>
              <td className="py-1.5 text-right tabular-nums">{row.get(data.withoutCoupon)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 border-t border-white/10 pt-3 text-xs text-muted-foreground">
        After a discount ran out, <span className="font-semibold text-foreground">{pct(data.postDiscount.rate)}</span> paid
        full price ({data.postDiscount.paidFullPriceAfter} of {data.postDiscount.discountEnded}, all time).
      </p>
    </div>
  );
}

function StatsTable({
  title,
  rows,
  windowDays,
}: {
  title: string;
  rows: { key: string; name: React.ReactNode; sub?: string | null; stats: CouponStats }[];
  windowDays: number;
}) {
  return (
    <div className={cn(card, "overflow-x-auto")}>
      <p className="mb-3 text-sm font-semibold">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No coupons used in this range.</p>
      ) : (
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-2 font-normal" />
              <th className="pb-2 text-right font-normal">Used</th>
              <th className="pb-2 text-right font-normal">New customers</th>
              <th className="pb-2 text-right font-normal">Discount given</th>
              <th className="pb-2 text-right font-normal">Revenue</th>
              <th className="pb-2 text-right font-normal">Canceled while on it</th>
              <th className="pb-2 text-right font-normal">Within {windowDays}d after</th>
              <th className="pb-2 text-right font-normal">Kept paying after</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {rows.map((r) => (
              <tr key={r.key}>
                <td className="py-2">
                  <div className="font-medium">{r.name}</div>
                  {r.sub && <div className="text-[11px] text-muted-foreground">{r.sub}</div>}
                </td>
                <td className="py-2 text-right tabular-nums">{r.stats.redemptions}</td>
                <td className="py-2 text-right tabular-nums">{r.stats.newCustomers}</td>
                <td className="py-2 text-right tabular-nums">{money(r.stats.totalDiscounted)}</td>
                <td className="py-2 text-right tabular-nums">{money(r.stats.revenue)}</td>
                <td className="py-2 text-right tabular-nums">{r.stats.canceledWhileDiscounted}</td>
                <td className="py-2 text-right tabular-nums">{r.stats.canceledWithinWindow}</td>
                <td className="py-2 text-right tabular-nums">
                  {r.stats.discountEnded ? pct(r.stats.postDiscountRetention) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const CATEGORY_LABEL: Record<CancelCategory, string> = {
  while_discounted: "While discounted",
  within_window: "Soon after discount",
  after_window: "Long after a coupon",
  never_discounted: "No coupon",
};

/** Admin: what coupons bring in, what they cost, and how coupon customers behave. */
export function DiscountAnalyticsPanel() {
  const [days, setDays] = useState(90);
  const [windowDays, setWindowDays] = useState(35);
  const [data, setData] = useState<DiscountAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    adminJson<DiscountAnalytics>(
      `/api/admin/billing/discounts?from=${from.toISOString()}&to=${to.toISOString()}&windowDays=${windowDays}`,
    )
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError((e as Error).message));
  }, [days, windowDays]);

  const c = data?.current;
  const p = data?.period;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Coupon analytics</h3>
          <p className="text-sm text-muted-foreground">From the billing history: redemptions, discounted invoices and cancellations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
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
          <div className="flex items-center rounded-lg border border-white/10 p-0.5" title="Cancellations within this many days after a discount ends count as 'soon after'">
            <span className="px-2 text-[11px] text-muted-foreground">Window</span>
            {WINDOWS.map((w) => (
              <button
                key={w}
                onClick={() => setWindowDays(w)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium",
                  windowDays === w ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {w}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {data && c && p ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile
              label="New subscribers with a coupon"
              value={`${p.newWithCoupon} of ${p.newSubscribers}`}
              hint={`${pct(p.couponShare)} of new subscribers in this range`}
            />
            <Tile label="Coupons redeemed" value={String(p.redemptions)} hint={`${p.redemptionsByNewCustomers} by first-time payers`} />
            <Tile label="Discount given" value={money(p.discountGiven)} hint={`${p.discountedInvoices} discounted invoices`} />
            <Tile
              label="Revenue from coupon customers"
              value={money(p.couponCustomerRevenue)}
              hint="Paid in this range by customers a coupon brought in"
            />
            <Tile
              label="On a discount now"
              value={`${c.discountedNow} of ${c.payingCustomers}`}
              hint={`${pct(c.discountedShare)} of paying customers`}
            />
            <Tile label="MRR given away" value={money(c.mrrDiscounted)} hint={`${money(c.mrr)} net of ${money(c.listMrr)} list MRR`} />
            <Tile label="Acquired with a coupon" value={String(c.customersAcquiredWithCoupon)} hint="All time, first payment discounted" />
            <Tile
              label="Kept paying after the discount"
              value={pct(data.retention.postDiscount.rate)}
              hint={`${data.retention.postDiscount.paidFullPriceAfter} of ${data.retention.postDiscount.discountEnded} whose discount ran out`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <AcquisitionChart monthly={data.monthly} />
            <CancellationSplit data={data} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <RetentionTable data={data.retention} />
            <div className={cn(card, "overflow-x-auto")}>
              <p className="text-sm font-semibold">Recent cancellations of coupon users</p>
              <p className="mb-3 text-xs text-muted-foreground">Dated when the user asked to cancel.</p>
              {data.cancellations.recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">None in this range.</p>
              ) : (
                <table className="w-full min-w-[420px] text-sm">
                  <tbody className="divide-y divide-white/[0.05]">
                    {data.cancellations.recent.map((r) => (
                      <tr key={r.subscriptionId}>
                        <td className="py-1.5">
                          <Link href={`/admin/users/${r.userId}`} className="hover:underline">
                            {r.email ?? r.userId}
                          </Link>
                          <div className="text-[11px] text-muted-foreground">
                            {r.planName ?? "—"} · {shortDate(r.canceledAt)}
                            {r.by ? ` · by ${humanize(r.by)}` : ""}
                          </div>
                        </td>
                        <td className="py-1.5 text-right">
                          <div className="font-mono text-xs">{r.couponCode ?? "—"}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {r.category === "within_window" || r.category === "after_window"
                              ? `${r.daysSinceDiscountEnded} days after it ended`
                              : CATEGORY_LABEL[r.category]}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <StatsTable
            title="By coupon (redeemed in this range)"
            windowDays={data.windowDays}
            rows={data.byCoupon.map((b) => ({
              key: b.couponId ?? "none",
              name: b.couponId ? (
                <Link href={`/admin/discounts/${b.couponId}`} className="hover:underline">
                  {b.name}
                </Link>
              ) : (
                b.name
              ),
              sub: [b.summary, b.campaign].filter(Boolean).join(" · "),
              stats: b.stats,
            }))}
          />
          <StatsTable
            title="By code source"
            windowDays={data.windowDays}
            rows={data.bySource.map((b) => ({ key: b.source, name: humanize(b.source), stats: b.stats }))}
          />
          {data.byAppliedVia.length > 0 && (
            <p className="text-xs text-muted-foreground">
              How codes were applied:{" "}
              {data.byAppliedVia.map((v) => `${humanize(v.appliedVia)} ${v.count}`).join(" · ")}
            </p>
          )}
        </>
      ) : (
        !error && <div className="h-48 animate-pulse rounded-xl bg-white/5" />
      )}
    </section>
  );
}
