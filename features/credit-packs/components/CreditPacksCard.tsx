"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { CheckoutCaptchaDialog } from "@/features/subscribe/components/CheckoutCaptchaDialog";
import { isFreePlan, UserPlanSummary } from "@/lib/subscription";
import { formatPackPrice } from "@/lib/types/credit-pack.type";
import { SettingsPanel } from "@/app/(protected)/(other)/me/settings/_components/SettingsUi";
import { fetchCreditPacks, startCreditPackCheckout } from "../api";

/** One-time credit packs: only buyable on an active plan. */
export function CreditPacksCard() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const subscription = user?.subscription as UserPlanSummary | undefined;
  const eligible = !!user && !isFreePlan(user) && subscription?.status === "active";

  const { data: packs, isLoading } = useQuery({
    queryKey: ["credit-packs"],
    queryFn: fetchCreditPacks,
    staleTime: 5 * 60_000,
    enabled: !!user,
  });

  // Back from Stripe.
  useEffect(() => {
    const result = searchParams.get("pack");
    if (!result) return;
    if (result === "success") {
      toast.success("Payment received. Your credits are being added (it can take a few seconds).");
      // The webhook may land a moment after the redirect: refresh twice.
      router.refresh();
      setTimeout(() => router.refresh(), 4000);
    } else if (result === "canceled") {
      toast("Checkout canceled. No charge was made.");
    }
    router.replace(pathname, { scroll: false });
  }, [searchParams, router, pathname]);

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

  if (!user) return null;

  return (
    <div id="credit-packs" className="scroll-mt-24">
      <SettingsPanel icon={Zap} title="Buy more credits">
        {!eligible ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <p className="text-sm text-white/60">
              {subscription?.status === "past_due"
                ? "Update your payment method to buy credit packs."
                : "Credit packs are available on an active plan. They top up your credits for generations."}
            </p>
            {subscription?.status !== "past_due" && (
              <Link
                href="/pricing"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                See plans
              </Link>
            )}
          </div>
        ) : isLoading ? (
          <div className="grid gap-3 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        ) : !packs?.length ? (
          <p className="text-sm text-white/40">No credit packs available right now.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {packs.map((pack) => (
              <div
                key={pack.id}
                className={cn(
                  "relative flex flex-col gap-3 rounded-xl border p-5",
                  pack.isMostPopular ? "border-primary/60 bg-primary/[0.06]" : "border-white/10 bg-white/[0.04]",
                )}
              >
                {pack.isMostPopular && (
                  <span className="absolute -top-2.5 left-5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground uppercase">
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
                <p className="flex-1 text-xs leading-relaxed text-white/50">{pack.description}</p>
                <button
                  type="button"
                  onClick={() => setBuyingId(pack.id)}
                  disabled={redirecting}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50",
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
        {eligible && (
          <p className="mt-3 text-[11px] text-white/35">
            One-time payment. Credits are added to your balance right away and don&apos;t reset with your plan.
          </p>
        )}
      </SettingsPanel>

      <CheckoutCaptchaDialog
        open={!!buyingId && !redirecting}
        onOpenChange={(open) => !open && setBuyingId(null)}
        onVerified={checkout}
        isRedirecting={redirecting}
      />
    </div>
  );
}
