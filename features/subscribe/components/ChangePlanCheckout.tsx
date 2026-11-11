"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Info, Loader2, Lock, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { isFreePlan } from "@/lib/subscription";
import { useBillingResult } from "@/features/billing-result/store";
import type { CheckoutPromotion } from "../hooks/use-checkout";
import { readStoredPromotion } from "../hooks/use-promotion-code";
import { PlanChangeError, useChangePlan, usePlanChangePreview } from "../hooks/use-change-plan";

const money = (cents: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: (currency || "usd").toUpperCase() }).format(
      cents / 100,
    );
  } catch {
    return `${(cents / 100).toFixed(2)}`;
  }
};
const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
const num = (n: number) => n.toLocaleString("en-US");

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6", className)}>{children}</div>
  );
}

function PlanTile({ label, name, credits, highlight }: { label: string; name: string; credits: number; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "flex-1 rounded-xl border p-4",
        highlight ? "border-primary/50 bg-primary/[0.07]" : "border-white/[0.08] bg-white/[0.02]",
      )}
    >
      <p className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">{label}</p>
      <p className={cn("mt-1 text-lg font-bold", highlight ? "text-white" : "text-white/80")}>{name}</p>
      <p className="mt-0.5 text-xs text-white/50">{num(credits)} credits / month</p>
    </div>
  );
}

/** "Upgrade to Pro": what it costs today, the renewal price, and a code box for the new plan. */
export function ChangePlanCheckout({ planId }: { planId: string | null }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuth()?.user;
  const openResult = useBillingResult((s) => s.open);
  const onPaidPlan = !!user && !isFreePlan(user);

  // A code carried over from a share link / the pricing page.
  const [promotion, setPromotion] = useState<CheckoutPromotion | null>(() => {
    const stored = typeof window === "undefined" ? null : readStoredPromotion();
    return stored?.code ? { code: stored.code, appliedVia: stored.appliedVia } : null;
  });
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");

  const preview = usePlanChangePreview(planId, promotion?.code ?? null, onPaidPlan);
  const { changePlan, isLoading: isPaying } = useChangePlan();
  const data = preview.data;
  const codeResult = data?.promotion ?? null;
  const codeIsValid = codeResult?.valid === true && codeResult.code === promotion?.code;

  const applyCode = (e: FormEvent) => {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();
    if (code) setPromotion({ code, appliedVia: "code_box" });
  };
  const removeCode = () => {
    setPromotion(null);
    setCodeInput("");
  };

  const confirm = async () => {
    if (!data || !planId) return;
    try {
      const res = await changePlan({
        planId,
        promotion: codeIsValid ? promotion : null,
        prorationDate: data.prorationDate,
      });
      void queryClient.invalidateQueries({ queryKey: ["current-user"] });
      if (res.changed === "upgraded") {
        openResult({
          variant: "upgraded",
          planName: res.result.planName,
          credits: res.result.creditsAdded || data.creditsAdded,
          amountPaid: res.result.amountPaid,
          currency: res.result.currency,
          balance: res.result.balance,
        });
      } else {
        openResult({ variant: "downgraded", planName: res.result.planName, nextBillingDate: res.result.nextBillingDate });
      }
      router.push("/me/settings/subscription");
      router.refresh();
    } catch (error) {
      const err = error as PlanChangeError;
      if (err.codeProblem && !err.cardProblem) {
        // The code ran out since it was checked: re-price without it.
        removeCode();
      }
      openResult({
        variant: "failed",
        title: data.isUpgrade ? "Upgrade didn't go through" : "Couldn't switch your plan",
        message: err.message,
        paymentMethod: err.cardProblem,
      });
    }
  };

  if (!user) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="text-white">Log in to change your plan.</p>
        <Link href="/login" className="bg-primary mt-4 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
          Log in
        </Link>
      </Card>
    );
  }
  if (!onPaidPlan || !planId) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="text-white">{!planId ? "Pick a plan first." : "You're on the free plan, so there's nothing to change yet."}</p>
        <Link href="/pricing" className="bg-primary mt-4 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
          View plans
        </Link>
      </Card>
    );
  }
  if (preview.isError && !data) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="text-white">{(preview.error as Error).message}</p>
        <Link href="/pricing" className="mt-4 inline-flex rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white">
          Back to plans
        </Link>
      </Card>
    );
  }
  if (!data) {
    return (
      <div className="grid gap-6 md:grid-cols-[1fr_380px]">
        <div className="h-72 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-96 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    );
  }

  const { isUpgrade, targetPlan, currentPlan, currency } = data;
  const period = targetPlan.billingPeriod === "YEARLY" ? "yr" : "mo";
  const repricing = preview.isFetching;

  return (
    <div className="grid items-start gap-6 md:grid-cols-[1fr_380px]">
      {/* What changes */}
      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <PlanTile label="Current plan" name={currentPlan?.name ?? "Current plan"} credits={currentPlan?.creditsPerMonth ?? 0} />
            <ArrowRight className="mx-auto size-5 shrink-0 rotate-90 text-white/30 sm:rotate-0" />
            <PlanTile label="New plan" name={targetPlan.name} credits={targetPlan.creditsPerMonth} highlight />
          </div>

          <ul className="mt-5 flex flex-col gap-2.5 text-sm text-white/65">
            {isUpgrade ? (
              <>
                <li>• Your upgrade starts right away.</li>
                <li>
                  • You pay today only for the rest of this billing period (your unused {currentPlan?.name ?? "plan"} time is
                  credited).
                </li>
                {data.creditsAdded > 0 && (
                  <li>
                    • <span className="font-semibold text-white">+{num(data.creditsAdded)} credits</span> are added as soon as you pay.
                  </li>
                )}
                <li>
                  • Then {money(data.nextRenewal.amount, currency)}/{period} from {day(data.nextRenewal.date)}.
                </li>
              </>
            ) : (
              <>
                <li>• No charge today.</li>
                <li>
                  • You keep {currentPlan?.name ?? "your plan"} and your credits until {day(data.nextRenewal.date)}.
                </li>
                <li>
                  • Then {money(data.nextRenewal.amount, currency)}/{period} on {targetPlan.name}.
                </li>
              </>
            )}
          </ul>
        </Card>

        {data.removedCoupon && (
          <div className="flex gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-4 text-sm text-amber-100/90">
            <Info className="mt-0.5 size-4 shrink-0 text-amber-300" />
            <p>
              Your current discount
              {(() => {
                const parts = [data.removedCoupon.code, data.removedCoupon.summary].filter(Boolean);
                return parts.length ? ` (${parts.join(" · ")})` : "";
              })()}{" "}
              ends with this change. Discounts only apply to the plan they were made for, but you can add a code for{" "}
              {targetPlan.name}.
            </p>
          </div>
        )}
      </div>

      {/* Order summary */}
      <Card className="md:sticky md:top-6">
        <p className="text-sm font-semibold text-white">Summary</p>

        {isUpgrade && data.lines.length > 0 && (
          <ul className={cn("mt-4 flex flex-col gap-2.5 text-[13px] transition-opacity", repricing && "opacity-50")}>
            {data.lines.map((line, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span className="text-white/55">{line.description}</span>
                <span className={cn("shrink-0 tabular-nums", line.amount < 0 ? "text-[#4ade80]" : "text-white/80")}>
                  {money(line.amount, currency)}
                </span>
              </li>
            ))}
            {data.discountTotal > 0 && (
              <li className="flex justify-between gap-4">
                <span className="text-white/55">Discount{codeIsValid ? ` (${promotion?.code})` : ""}</span>
                <span className="shrink-0 text-[#4ade80] tabular-nums">−{money(data.discountTotal, currency)}</span>
              </li>
            )}
          </ul>
        )}

        {/* Code box */}
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          {codeIsValid && codeResult?.valid ? (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-[#4ade80]/30 bg-[#4ade80]/10 px-3 py-2 text-[13px]">
              <span className="flex min-w-0 items-center gap-2">
                <Tag className="size-3.5 shrink-0 text-[#4ade80]" />
                <span className="font-mono font-bold text-white">{codeResult.code}</span>
                <span className="truncate text-white/60">{codeResult.summary}</span>
              </span>
              <button type="button" onClick={removeCode} aria-label="Remove code" className="cursor-pointer text-white/50 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
          ) : codeOpen || promotion ? (
            <form onSubmit={applyCode} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder={promotion?.code ?? "Promotion code"}
                  maxLength={64}
                  autoFocus
                  className="focus:border-primary h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 font-mono text-sm text-white uppercase outline-none placeholder:normal-case placeholder:text-white/30"
                />
                <button
                  type="submit"
                  disabled={!codeInput.trim() || repricing}
                  className="h-10 cursor-pointer rounded-xl border border-white/10 px-4 text-sm font-medium text-white hover:bg-white/[0.06] disabled:opacity-40"
                >
                  {repricing && promotion ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                </button>
              </div>
              {codeResult && !codeResult.valid && codeResult.code === promotion?.code && (
                <p className="text-xs text-red-400">
                  {codeResult.code}: {codeResult.message}
                </p>
              )}
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setCodeOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 text-[13px] text-white/55 hover:text-white"
            >
              <Tag className="size-3.5" />
              Have a code for {targetPlan.name}?
            </button>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-4 border-t border-white/[0.06] pt-4">
          <div>
            <p className="text-sm font-semibold text-white">Due today</p>
            <p className="mt-0.5 text-xs text-white/45">
              Then {money(data.nextRenewal.amount, currency)}/{period} from {day(data.nextRenewal.date)}
            </p>
          </div>
          <p className={cn("text-2xl font-extrabold text-white tabular-nums transition-opacity", repricing && "opacity-50")}>
            {money(data.dueNow, currency)}
          </p>
        </div>

        <button
          type="button"
          onClick={confirm}
          disabled={isPaying || repricing}
          className="bg-primary mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-[0_0_32px_-8px_var(--color-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPaying && <Loader2 className="size-4 animate-spin" />}
          {isUpgrade ? `Pay ${money(data.dueNow, currency)} & upgrade` : `Switch to ${targetPlan.name}`}
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/40">
          <Lock className="size-3" />
          {isUpgrade ? "Charged to your saved payment method. Cancel anytime." : "Takes effect at your next renewal."}
        </p>
      </Card>
    </div>
  );
}

/** Page frame: back link and title around the checkout. */
export function ChangePlanCheckoutPage({ planId }: { planId: string | null }) {
  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 pt-8 pb-16 sm:pt-12">
      <Link href="/pricing" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-white">
        <ArrowLeft className="size-4" />
        Back to plans
      </Link>
      <h1 className="mb-8 text-[32px] leading-none font-extrabold tracking-tight text-white sm:text-[40px]">Change your plan</h1>
      <ChangePlanCheckout planId={planId} />
    </div>
  );
}
