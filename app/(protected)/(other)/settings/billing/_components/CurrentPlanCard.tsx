"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useCreditsAllowance } from "@/features/subscribe/hooks/use-credits-allowance";
import { SubscriptionPlan } from "@/lib/types/subscription-plan.type";
import { CancelSubscriptionDialog } from "./CancelSubscriptionDialog";

const CARD_STYLE = {
  background: "oklch(0.13 0 0)",
  borderColor: "rgba(255,255,255,0.07)",
};

async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await fetch("/api/subscription-plans");
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

function formatPrice(plan?: SubscriptionPlan): string | null {
  if (!plan || typeof plan.priceAmount !== "number") return null;
  const period = plan.billingPeriod === "YEARLY" ? "year" : "month";
  return `$${plan.priceAmount} / ${period}`;
}

export function CurrentPlanCard() {
  const { user } = useCurrentUser();
  const { remaining, allowance, used, usedPercentage, hasAllowance } =
    useCreditsAllowance(user);

  // Shares the query key with useCreditsAllowance, so this is cache-only.
  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: fetchSubscriptionPlans,
    staleTime: 5 * 60_000,
    enabled: !!user,
  });

  if (!user) return null;

  const planName: string = user?.subscription?.name ?? "Free Plan";
  const subscriptionId: string | undefined = user?.subscription?.id;
  const isFreePlan = planName === "Free Plan";
  const currentPlan = plans?.find((plan) => plan.id === subscriptionId);
  const price = formatPrice(currentPlan);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border p-6" style={CARD_STYLE}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Current plan
            </p>
            <p className="mt-1.5 text-2xl font-bold text-white capitalize">
              {planName}
            </p>
            {price && (
              <p
                className="mt-0.5 text-sm"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {price}
              </p>
            )}
          </div>

          <Link
            href="/subscription-plans"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6b41ff, #ea4bff)" }}
          >
            {isFreePlan ? "Upgrade" : "Change plan"}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {/* Hidden rather than shown at 0% when the plan lookup finds nothing. */}
        {hasAllowance && (
          <div
            className="mt-6 border-t pt-5"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="mb-2.5 flex items-center justify-between text-sm">
              <span style={{ color: "rgba(255,255,255,0.45)" }}>
                Monthly credits
              </span>
              <span className="font-medium tabular-nums text-white">
                {used.toLocaleString("en-US")} /{" "}
                {allowance.toLocaleString("en-US")} used
              </span>
            </div>

            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${usedPercentage}%`,
                  background:
                    usedPercentage >= 90
                      ? "linear-gradient(90deg, #ef4444, #f97316)"
                      : "linear-gradient(90deg, #6b41ff, #ea4bff)",
                }}
              />
            </div>

            <p
              className="mt-2 text-right text-xs"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {remaining.toLocaleString("en-US")} credits remaining
            </p>
          </div>
        )}
      </div>

      {!isFreePlan && subscriptionId && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-5"
          style={{
            borderColor: "rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.04)",
          }}
        >
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "rgba(239,68,68,0.9)" }}
            >
              Cancel subscription
            </p>
            <p
              className="mt-0.5 text-xs"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Your monthly credits will stop renewing.
            </p>
          </div>

          <CancelSubscriptionDialog
            subscriptionId={subscriptionId}
            planName={planName}
            monthlyCredits={allowance}
          />
        </div>
      )}
    </div>
  );
}
