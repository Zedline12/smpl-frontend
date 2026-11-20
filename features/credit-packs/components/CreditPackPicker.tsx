"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckoutCaptchaDialog } from "@/features/subscribe/components/CheckoutCaptchaDialog";
import { isFreePlan, UserPlanSummary } from "@/lib/subscription";
import { formatPackPrice } from "@/lib/types/credit-pack.type";
import { fetchCreditPacks, startCreditPackCheckout } from "../api";

export type CreditPackEligibility = "eligible" | "past_due" | "no_plan";

/** Packs are only sold on an active paid plan. */
export function creditPackEligibility(user: any): CreditPackEligibility {
  const subscription = user?.subscription as UserPlanSummary | undefined;
  if (subscription?.status === "past_due") return "past_due";
  if (!user || isFreePlan(user) || subscription?.status !== "active") return "no_plan";
  return "eligible";
}

/**
 * The buyable packs with their Buy buttons; Buy asks for the captcha, then goes to
 * Stripe. One column on phones, `columns` from sm up.
 */
export function CreditPackPicker({ columns = 3 }: { columns?: 2 | 3 }) {
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const { data: packs, isLoading } = useQuery({
    queryKey: ["credit-packs"],
    queryFn: fetchCreditPacks,
    staleTime: 5 * 60_000,
  });

  // Back from Stripe: the billing popup (BillingResultWatcher) shows the result.
  const checkout = async (token: string) => {
    if (!buyingId) return;
    setRedirecting(true);
    try {
      window.location.href = await startCreditPackCheckout(buyingId, token);
    } catch (error) {
      toast.error((error as Error).message);
      setRedirecting(false);
      setBuyingId(null);
    }
  };

  const grid = cn("grid gap-3", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2");

  return (
    <>
      {isLoading ? (
        <div className={grid}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      ) : !packs?.length ? (
        <p className="text-sm text-white/40">No credit packs available right now.</p>
      ) : (
        <div className={grid}>
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={cn(
                "relative flex flex-col gap-3 rounded-xl border p-4 sm:p-5",
                pack.isMostPopular ? "border-primary/60 bg-primary/[0.06]" : "border-white/10 bg-white/[0.04]",
              )}
            >
              {pack.isMostPopular && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground uppercase sm:left-5">
                  Most popular
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-white">{pack.name}</p>
                <p className="mt-1 text-2xl font-bold text-white tabular-nums">
                  {pack.credits.toLocaleString("en-US")}
                  <span className="ml-1.5 text-sm font-normal text-white/50">credits</span>
                </p>
              </div>
              {pack.description && (
                <p className="flex-1 text-xs leading-relaxed text-white/50">{pack.description}</p>
              )}
              <button
                type="button"
                onClick={() => setBuyingId(pack.id)}
                disabled={redirecting}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50",
                  pack.isMostPopular ? "bg-primary text-primary-foreground" : "bg-white text-black",
                )}
              >
                {redirecting && buyingId === pack.id && <Loader2 className="size-4 animate-spin" />}
                Buy · {formatPackPrice(pack)}
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-[11px] text-white/35">
        One-time payment. Credits are added to your balance right away and don&apos;t reset with your plan.
      </p>

      <CheckoutCaptchaDialog
        open={!!buyingId && !redirecting}
        onOpenChange={(open) => !open && setBuyingId(null)}
        onVerified={checkout}
        isRedirecting={redirecting}
      />
    </>
  );
}
