"use client";

import {
  billingPeriod,
  SubscriptionPlan,
} from "@/lib/types/subscription-plan.type";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "../hooks/use-checkout";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { CheckoutCaptchaDialog } from "./CheckoutCaptchaDialog";
import { ChevronDown } from "lucide-react";

interface SubscriptionGridProps {
  plans: SubscriptionPlan[];
  isLoading: boolean;
}

const PLAN_STYLES = [
  {
    bg: "#1a1a1a",
    border: "rgba(255,255,255,0.08)",
    hoverBorder: "rgba(255,255,255,0.18)",
    accent: "#ffffff",
    ctaBg: "#ffffff",
    ctaText: "#0a0a0a",
    barColor: "rgba(255,255,255,0.35)",
    subtitle: "For first-time AI creators",
    ctaHover: "rgba(240,240,240,1)",
  },
  {
    bg: "#1a1530",
    border: "rgba(107,65,255,0.4)",
    hoverBorder: "rgba(107,65,255,0.7)",
    accent: "#6b41ff",
    ctaBg: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)",
    ctaText: "#ffffff",
    barColor: "#6b41ff",
    subtitle: "For everyday AI creation",
    ctaHover: null,
  },
  {
    bg: "#1e1228",
    border: "rgba(234,75,255,0.4)",
    hoverBorder: "rgba(234,75,255,0.7)",
    accent: "#ea4bff",
    ctaBg: "#ea4bff",
    ctaText: "#ffffff",
    barColor: "#ea4bff",
    subtitle: "For ambitious AI projects",
    ctaHover: "#d93df5",
  },
];

const FAQ_ITEMS = [
  {
    q: "How do credits work?",
    a: "Credits are consumed each time you generate media. Different models cost different amounts of credits per generation. Your credits refresh every month based on your plan.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel at any time. Your plan stays active until the end of the current billing period, and you won't be charged again.",
  },
  {
    q: "What happens when I run out of credits?",
    a: "Once your credits are depleted, you'll need to wait until the next billing cycle or upgrade to a higher plan to continue generating.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade your plan at any time from your account settings. Changes take effect at the next billing cycle.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — every new account starts with 50 free one-time credits so you can try smpl before committing to a paid plan.",
  },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="max-w-[720px] mx-auto px-4 mt-20 mb-16">
      <h2 className="text-[28px] font-bold text-center mb-2">
        Frequently Asked Questions
      </h2>
      <p className="text-center text-sm mb-10" style={{ color: "var(--fg-3)" }}>
        Everything you need to know about smpl pricing
      </p>
      <div className="rounded-[16px] border overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.08)", background: "#1a1a1a" }}>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} style={{ borderBottom: i < FAQ_ITEMS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : undefined }}>
            <button
              type="button"
              className="w-full flex items-center justify-between px-6 py-5 text-left"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="text-[15px] font-medium text-white">{item.q}</span>
              <ChevronDown
                className="w-4 h-4 flex-shrink-0 ml-4 transition-transform duration-200"
                style={{
                  color: "var(--fg-3)",
                  transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {open === i && (
              <div className="px-6 pb-5 text-[14px] leading-relaxed" style={{ color: "var(--fg-3)" }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubscriptionGrid({ plans, isLoading }: SubscriptionGridProps) {
  const [period, setPeriod] = useState<billingPeriod>(billingPeriod.YEARLY);

  const router = useRouter();
  const user = useAuth()?.user;
  const { startCheckout, isLoading: isCheckoutLoading } = useCheckout();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [captchaPlanId, setCaptchaPlanId] = useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setCaptchaPlanId(planId);
  };

  const handleCaptchaVerified = (token: string) => {
    if (!captchaPlanId) return;
    setProcessingPlanId(captchaPlanId);
    startCheckout(captchaPlanId, token);
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-5 max-w-[960px] mx-auto px-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[16px] border h-96 animate-pulse"
            style={{ background: "#1a1a1a", borderColor: "rgba(255,255,255,0.08)" }}
          />
        ))}
      </div>
    );
  }

  if (!plans?.length) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No plans available at the moment.
      </div>
    );
  }

  const sortOrder: Record<string, number> = {
    basic: 1,
    creator: 2,
    "creator pro": 3,
  };

  const filteredPlans = plans
    .filter((plan) => plan.billingPeriod === period && plan.priceAmount != 0)
    .sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      return (sortOrder[aName] || 99) - (sortOrder[bName] || 99);
    });

  const isYearly = period === billingPeriod.YEARLY;
  const maxCredits = Math.max(...filteredPlans.map((p) => p.creditsPerMonth ?? 0), 1);

  return (
    <>
      {/* Billing toggle */}
      <div className="flex justify-center items-center gap-3 mb-10">
        <button
          onClick={() => setPeriod(billingPeriod.MONTHLY)}
          className={cn(
            "px-6 py-2 rounded-[999px] border text-[14px] font-semibold transition-all",
            period === billingPeriod.MONTHLY
              ? "bg-foreground text-background border-transparent"
              : "bg-transparent border-border text-muted-foreground hover:text-foreground",
          )}
        >
          Monthly
        </button>

        <button
          onClick={() => setPeriod(billingPeriod.YEARLY)}
          className={cn(
            "px-6 py-2 rounded-[999px] border text-[14px] font-semibold transition-all flex items-center gap-2",
            period === billingPeriod.YEARLY
              ? "bg-foreground text-background border-transparent"
              : "bg-transparent border-border text-muted-foreground hover:text-foreground",
          )}
        >
          Annual
          <span
            className="text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#d4fc0e" }}
          >
            Save 25%
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-5 max-w-[960px] mx-auto px-4">
        {filteredPlans.map((plan, idx) => {
          const style = PLAN_STYLES[Math.min(idx, PLAN_STYLES.length - 1)];

          const correspondingMonthly = plans.find(
            (p) =>
              p.name === plan.name && p.billingPeriod === billingPeriod.MONTHLY,
          );
          const monthlyPrice = correspondingMonthly?.priceAmount || 0;
          const averageMonthly = isYearly ? plan.priceAmount / 12 : plan.priceAmount;
          const yearlySavings = isYearly ? monthlyPrice * 12 - plan.priceAmount : 0;
          const discountPct =
            isYearly && monthlyPrice > 0
              ? Math.round((1 - averageMonthly / monthlyPrice) * 100)
              : 0;

          const creditsBarPct = Math.round(((plan.creditsPerMonth ?? 0) / maxCredits) * 100);

          const planLabel = plan.name.toUpperCase();

          return (
            <div
              key={plan.id}
              className="relative rounded-[16px] p-6 flex flex-col transition-all duration-200"
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = style.hoverBorder;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = style.border;
              }}
            >
              {/* Plan name + discount badge */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[18px] font-extrabold tracking-wide text-white">
                  {planLabel}
                </span>
                {discountPct > 0 && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ background: "#d4fc0e", color: "#0a0a0a" }}
                  >
                    {discountPct}% OFF
                  </span>
                )}
                {plan.isMostPopular && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ background: "#1e40af", color: "#93c5fd" }}
                  >
                    BEST VALUE
                  </span>
                )}
              </div>

              {/* Subtitle */}
              <p className="text-[13px] mb-5" style={{ color: "var(--fg-3)" }}>
                {style.subtitle}
              </p>

              {/* Credits block */}
              <div
                className="rounded-[10px] p-4 mb-5"
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="text-[15px] font-bold text-white mb-0.5">
                  {plan.creditsPerMonth?.toLocaleString()} credits/mo.
                </div>
                {plan.metadata?.[0] && (
                  <div className="text-[12px] mb-3" style={{ color: "var(--fg-3)" }}>
                    ≈ {plan.metadata[0]}
                  </div>
                )}
                {/* Range bar */}
                <div className="relative h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                    style={{ width: `${creditsBarPct}%`, background: style.barColor }}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="mb-5">
                {isYearly && discountPct > 0 && (
                  <div className="text-[14px] line-through mb-0.5" style={{ color: "var(--fg-3)" }}>
                    ${monthlyPrice}
                  </div>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-[38px] font-extrabold text-white leading-none">
                    ${averageMonthly % 1 === 0 ? averageMonthly.toFixed(0) : averageMonthly.toFixed(2)}
                  </span>
                  <span className="text-[13px]" style={{ color: "var(--fg-3)" }}>
                    per month, billed {isYearly ? "annually" : "monthly"}
                  </span>
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCheckoutLoading && processingPlanId === plan.id}
                className="w-full py-3 rounded-[10px] text-[14px] font-bold transition-all disabled:opacity-50 mb-2"
                style={{
                  background: style.ctaBg,
                  color: style.ctaText,
                }}
              >
                {isCheckoutLoading && processingPlanId === plan.id
                  ? "Redirecting…"
                  : `Get ${plan.name}`}
              </button>

              {/* Save note */}
              <div className="text-center text-[12px] mb-5" style={{ color: "var(--fg-3)" }}>
                {isYearly && yearlySavings > 0
                  ? `Save $${Math.round(yearlySavings)} compared to monthly`
                  : "No difference compared to monthly"}
              </div>

              {/* Divider + features */}
              <div className="border-t mb-4" style={{ borderColor: "rgba(255,255,255,0.07)" }} />

              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#4ade80" }}>
                  Included features
                </span>
              </div>

              <div className="space-y-2.5 flex-grow">
                {(plan.metadata || []).slice(1).map((meta, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke={style.accent} strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[13px] leading-snug" style={{ color: "rgba(255,255,255,0.75)" }}>
                      {meta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Free tier */}
      <div className="max-w-[960px] mx-auto px-4 mt-5 pb-4">
        <div
          className="rounded-[16px] p-6 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex flex-col text-left min-w-[140px]">
            <div className="text-[16px] font-bold mb-1 text-white">Free Plan</div>
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-bold text-white">$0</span>
              <span className="text-[14px]" style={{ color: "var(--fg-3)" }}>/mo</span>
            </div>
          </div>

          <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--fg-3)" }}>
              One-Time Credits
            </div>
            <div className="text-[16px] font-bold mb-3 text-white">50 credits</div>
            <div className="flex flex-col md:flex-row gap-3 md:gap-6">
              {["Access to basic generation", "Standard quality outputs"].map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#4ade80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.75)" }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center flex-shrink-0">
            <div className="text-[12px]" style={{ color: "var(--fg-3)" }}>
              No credit card required
            </div>
          </div>
        </div>
      </div>

      <FaqAccordion />

      <CheckoutCaptchaDialog
        open={!!captchaPlanId}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setCaptchaPlanId(null);
        }}
        onVerified={handleCaptchaVerified}
        isRedirecting={isCheckoutLoading}
      />
    </>
  );
}
