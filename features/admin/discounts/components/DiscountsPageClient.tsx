"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, Plus, RefreshCw, Tag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { money } from "@/features/admin/users/types/billing";
import { adminJson, CouponListItem, pct } from "../types";
import { CreateCouponDialog } from "./CreateCouponDialog";
import { DiscountAnalyticsPanel } from "./DiscountAnalyticsPanel";

const card = "rounded-xl border border-white/10 bg-background-light";

/** Admin: every coupon with its codes and results, plus coupon analytics. */
export default function DiscountsPageClient() {
  const [coupons, setCoupons] = useState<CouponListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  const load = useCallback(async () => {
    try {
      setCoupons(await adminJson<CouponListItem[]>("/api/admin/coupons"));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const syncFromStripe = async () => {
    setSyncing(true);
    try {
      const r = await adminJson<{ coupons: number; codes: number }>("/api/admin/coupons/sync", { method: "POST" });
      toast.success(`Copied ${r.coupons} coupons and ${r.codes} codes from Stripe.`);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSyncing(false);
    }
  };

  const visible = (coupons ?? []).filter((c) => showDeleted || !c.deletedAt);
  const hiddenCount = (coupons ?? []).length - visible.length;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Coupons</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={syncFromStripe}
              disabled={syncing}
              title="Copy coupons and codes created in the Stripe dashboard"
              className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/5 disabled:opacity-50"
            >
              {syncing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Sync from Stripe
            </button>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="size-3.5" /> New coupon
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className={cn(card, "overflow-x-auto")}>
          {!coupons ? (
            <div className="h-32 animate-pulse" />
          ) : visible.length === 0 ? (
            <div className="py-14 text-center text-sm text-white/40">
              No coupons yet. Create one, or sync the ones you made in Stripe.
            </div>
          ) : (
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-white/40">
                  <th className="px-4 py-3 font-medium">Coupon</th>
                  <th className="px-4 py-3 font-medium">Codes</th>
                  <th className="px-4 py-3 text-right font-medium">Used</th>
                  <th className="px-4 py-3 text-right font-medium">Running now</th>
                  <th className="px-4 py-3 text-right font-medium">New customers</th>
                  <th className="px-4 py-3 text-right font-medium">Discount given</th>
                  <th className="px-4 py-3 text-right font-medium">Revenue</th>
                  <th className="px-4 py-3 text-right font-medium">Kept paying after</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {visible.map((c) => (
                  <tr key={c.id} className={cn("transition-colors hover:bg-white/[0.02]", c.deletedAt && "opacity-50")}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/discounts/${c.id}`} className="font-medium hover:underline">
                        {c.name ?? c.providerCouponId}
                      </Link>
                      <div className="text-[11px] text-white/45">
                        {c.summary}
                        {c.campaign ? ` · ${c.campaign}` : ""}
                        {c.deletedAt ? " · deleted" : !c.valid ? " · no longer redeemable" : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {c.codes.length === 0 && <span className="text-xs text-white/35">—</span>}
                        {c.codes.slice(0, 4).map((code) => (
                          <span
                            key={code.id}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px]",
                              code.active ? "border-white/15 text-white/85" : "border-white/5 text-white/35 line-through",
                            )}
                          >
                            <Tag className="size-2.5" />
                            {code.code}
                          </span>
                        ))}
                        {c.codes.length > 4 && <span className="text-[11px] text-white/40">+{c.codes.length - 4}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {c.stats.redemptions}
                      {c.maxRedemptions ? <span className="text-white/35"> / {c.maxRedemptions}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.stats.activeNow}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.stats.newCustomers}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(c.stats.totalDiscounted)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(c.stats.revenue)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {c.stats.discountEnded ? pct(c.stats.postDiscountRetention) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/discounts/${c.id}`} className="text-white/40 hover:text-white" aria-label="Open coupon">
                        <ChevronRight className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {hiddenCount > 0 && (
          <button onClick={() => setShowDeleted(true)} className="text-xs text-white/45 hover:text-white">
            Show {hiddenCount} deleted coupon{hiddenCount === 1 ? "" : "s"}
          </button>
        )}
      </section>

      <DiscountAnalyticsPanel />

      <CreateCouponDialog open={creating} onOpenChange={setCreating} onCreated={load} />
    </div>
  );
}
