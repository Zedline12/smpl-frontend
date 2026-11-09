"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowUpRight, CalendarClock, Coins, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useCreditsAllowance } from "@/features/subscribe/hooks/use-credits-allowance";
import { SubscriptionPlan } from "@/lib/types/subscription-plan.type";
import { isFreePlan, UserPlanSummary } from "@/lib/subscription";
import { CancelSubscriptionDialog } from "./CancelSubscriptionDialog";
import { SettingsPanel, SettingsTile } from "../../_components/SettingsUi";

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

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString(undefined, { dateStyle: "long" }) : null;

function usePlan() {
  const { user } = useCurrentUser();
  // Shares the query key with useCreditsAllowance, so this is cache-only.
  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: fetchSubscriptionPlans,
    staleTime: 5 * 60_000,
    enabled: !!user,
  });
  const subscription = user?.subscription as UserPlanSummary | undefined;
  const planName: string = subscription?.name ?? "Free Plan";
  const subscriptionId: string | undefined = subscription?.id;
  return {
    user,
    planName,
    subscriptionId,
    isFreePlan: isFreePlan(user),
    isCanceling: !!subscription?.cancelAtPeriodEnd,
    isPastDue: subscription?.status === "past_due",
    periodEnd: subscription?.currentPeriodEnd ?? null,
    price: formatPrice(plans?.find((plan) => plan.id === subscriptionId)),
  };
}

/** Undoes a scheduled cancellation. */
function ResumeButton() {
  const router = useRouter();
  const resume = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user-subscriptions/resume", { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Could not keep your plan");
      return json;
    },
    onSuccess: () => {
      toast.success("Your plan will keep renewing.");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });
  return (
    <button
      type="button"
      onClick={() => resume.mutate()}
      disabled={resume.isPending}
      className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {resume.isPending && <Loader2 className="size-3.5 animate-spin" />}
      Keep my plan
    </button>
  );
}

/** Card 1: the current plan, its renewal state and the upgrade button. */
export function PlanCard() {
  const { user, planName, isFreePlan: onFree, price, isCanceling, isPastDue, periodEnd } = usePlan();
  if (!user) return null;
  const endDate = formatDate(periodEnd);

  return (
    <SettingsPanel icon={Crown} title="Plan">
      <SettingsTile className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xl font-bold text-white capitalize">{planName}</p>
          {price && <p className="mt-0.5 text-sm text-white/45">{price}</p>}
          {!onFree && endDate && !isCanceling && !isPastDue && (
            <p className="mt-0.5 text-xs text-white/40">Renews on {endDate}</p>
          )}
        </div>
        <Link
          href="/pricing"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {onFree ? "Upgrade plan" : "Change plan"}
          <ArrowUpRight className="size-4" />
        </Link>
      </SettingsTile>

      {isCanceling && (
        <SettingsTile className="mt-2 flex flex-wrap items-center justify-between gap-3 border-amber-400/20 bg-amber-400/[0.06]">
          <p className="flex items-center gap-2 text-sm text-amber-200">
            <CalendarClock className="size-4 shrink-0" />
            {endDate
              ? `Your plan ends on ${endDate}. After that you'll be on the Free plan.`
              : "Your plan ends at the end of this period."}
          </p>
          <ResumeButton />
        </SettingsTile>
      )}

      {isPastDue && (
        <SettingsTile className="mt-2 flex flex-wrap items-center justify-between gap-3 border-red-400/20 bg-red-500/[0.06]">
          <p className="flex items-center gap-2 text-sm text-red-200">
            <AlertTriangle className="size-4 shrink-0" />
            Your last payment failed. Update your card to keep {planName}.
          </p>
          <ManageBillingButton label="Update card" />
        </SettingsTile>
      )}
    </SettingsPanel>
  );
}

/** Card 2: how much of the monthly credits is left. */
export function MonthlyCreditsCard() {
  const { user } = useCurrentUser();
  const { remaining, allowance, used, usedPercentage, hasAllowance } =
    useCreditsAllowance(user);
  if (!user) return null;

  return (
    <SettingsPanel icon={Coins} title="Monthly credits">
      <SettingsTile>
        {hasAllowance ? (
          <>
            <div className="mb-2.5 flex items-end justify-between gap-3">
              <p className="text-xl font-bold text-white tabular-nums">
                {remaining.toLocaleString("en-US")}
                <span className="ml-1.5 text-sm font-normal text-white/45">credits left</span>
              </p>
              <span className="text-sm text-white/50 tabular-nums">
                {used.toLocaleString("en-US")} / {allowance.toLocaleString("en-US")} used
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${usedPercentage}%`,
                  background:
                    usedPercentage >= 90
                      ? "linear-gradient(90deg, #ef4444, #f97316)"
                      : "var(--color-primary)",
                }}
              />
            </div>
          </>
        ) : (
          <p className="text-xl font-bold text-white tabular-nums">
            {(user.creditsBalance ?? 0).toLocaleString("en-US")}
            <span className="ml-1.5 text-sm font-normal text-white/45">credits available</span>
          </p>
        )}
      </SettingsTile>
    </SettingsPanel>
  );
}

/** Opens the user's Stripe billing portal. */
export function ManageBillingButton({ label = "Manage" }: { label?: string } = {}) {
  const [loading, setLoading] = useState(false);

  const open = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/billing-portal", { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.url) throw new Error(json?.message ?? "Could not open billing");
      window.location.href = json.url;
    } catch (error) {
      toast.error((error as Error).message);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={open}
      disabled={loading}
      className="flex shrink-0 items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-60"
    >
      {loading && <Loader2 className="size-3.5 animate-spin" />}
      {label}
    </button>
  );
}

/** Cancel the paid plan (only shown on a paid plan that isn't already ending). */
export function CancelPlanCard() {
  const { user, planName, subscriptionId, isFreePlan: onFree, isCanceling, periodEnd } = usePlan();
  if (!user || onFree || !subscriptionId || isCanceling) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-5"
      style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)" }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: "rgba(239,68,68,0.9)" }}>
          Cancel subscription
        </p>
        <p className="mt-0.5 text-xs text-white/35">
          You keep your plan until the end of the paid period, then your credits stop renewing.
        </p>
      </div>
      <CancelSubscriptionDialog planName={planName} endsAt={periodEnd} />
    </div>
  );
}
