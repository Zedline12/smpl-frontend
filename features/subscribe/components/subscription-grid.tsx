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
import { Check, ChevronDown, Layers } from "lucide-react";

interface SubscriptionGridProps {
  plans: SubscriptionPlan[];
  isLoading: boolean;
}

type Tier = "starter" | "creator" | "pro";

/** Only the name header carries a fill; the card itself is just a hairline border. */
const TIER_STYLES: Record<
  Tier,
  {
    header: string;
    headerText: string;
    subtitleText: string;
    accent: string;
    bar: string;
    cta: string;
    subtitle: string;
  }
> = {
  starter: {
    header: "bg-foreground/[0.07]",
    headerText: "text-foreground",
    subtitleText: "text-muted-foreground",
    accent: "text-foreground",
    bar: "bg-foreground/40",
    cta: "bg-foreground text-background hover:bg-foreground/90",
    subtitle: "For first-time AI creators",
  },
  creator: {
    header: "bg-secondary",
    headerText: "text-white",
    subtitleText: "text-white/80",
    accent: "text-secondary",
    bar: "bg-secondary",
    cta: "bg-secondary text-white hover:bg-secondary/90",
    subtitle: "For everyday AI creation",
  },
  pro: {
    header: "bg-primary",
    headerText: "text-white",
    subtitleText: "text-white/80",
    accent: "text-primary",
    bar: "bg-primary",
    cta: "bg-primary text-white hover:bg-primary/90",
    subtitle: "For ambitious AI projects",
  },
};

const TIER_ORDER: Tier[] = ["starter", "creator", "pro"];

function tierOf(plan: SubscriptionPlan, index: number): Tier {
  if (/pro/i.test(plan.name)) return "pro";
  if (/creator/i.test(plan.name)) return "creator";
  if (/starter|basic/i.test(plan.name)) return "starter";
  return TIER_ORDER[Math.min(index, TIER_ORDER.length - 1)];
}

function concurrencyLabel(n = 1) {
  return n <= 1 ? "1 generation at a time" : `Up to ${n} generations at once`;
}

const FAQ_ITEMS = [
  {
    q: "How do credits work?",
    a: "Credits are consumed each time you generate media. Different models cost different amounts of credits per generation. Your credits refresh every month based on your plan.",
  },
  {
    q: "How many generations can run at once?",
    a: "Free and Starter run one generation at a time, Creator runs up to 3, and Pro up to 10. You can still queue more: extra generations wait and start automatically as soon as one finishes.",
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
      <p className="text-center text-sm mb-10 text-muted-foreground">
        Everything you need to know about smpl pricing
      </p>
      <div className="rounded-2xl border border-foreground/[0.08] divide-y divide-foreground/[0.07] overflow-hidden">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i}>
            <button
              type="button"
              className="w-full flex items-center justify-between px-6 py-5 text-left"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span className="text-[15px] font-medium text-foreground">{item.q}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 flex-shrink-0 ml-4 text-muted-foreground transition-transform duration-200",
                  open === i && "rotate-180",
                )}
              />
            </button>
            {open === i && (
              <div className="px-6 pb-5 text-[14px] leading-relaxed text-muted-foreground">
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
      <div className="grid md:grid-cols-3 gap-5 max-w-[1000px] mx-auto px-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-foreground/[0.08] p-7 h-96">
            <div className="h-20 rounded-xl bg-foreground/[0.05] animate-pulse" />
          </div>
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

  const freePlan = plans.find((p) => p.priceAmount === 0);
  const filteredPlans = plans
    .filter((plan) => plan.billingPeriod === period && plan.priceAmount !== 0)
    .sort((a, b) => a.priceAmount - b.priceAmount);

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
          <span className="text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4fc0e]">
            Save 25%
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-5 max-w-[1000px] mx-auto px-4">
        {filteredPlans.map((plan, idx) => {
          const tier = tierOf(plan, idx);
          const style = TIER_STYLES[tier];

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
          const features = [
            concurrencyLabel(plan.maxConcurrentJobs),
            ...(plan.metadata || []).slice(1),
          ];
          const isCurrent = user?.subscription?.id === plan.id;
          const isRedirecting = isCheckoutLoading && processingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className="relative flex flex-col rounded-2xl border border-foreground/[0.08] bg-transparent p-7 transition-colors duration-200 hover:border-foreground/[0.16]"
            >
              {/* Plan name header: the only filled block on the card */}
              <div className={cn("rounded-xl px-5 py-4 mb-6", style.header)}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("text-[18px] font-extrabold tracking-wide uppercase", style.headerText)}>
                    {plan.name}
                  </span>
                  {discountPct > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#d4fc0e] text-[#0a0a0a]">
                      {discountPct}% OFF
                    </span>
                  )}
                  {plan.isMostPopular && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded",
                        tier === "starter" ? "bg-primary text-white" : "bg-white text-black",
                      )}
                    >
                      BEST VALUE
                    </span>
                  )}
                </div>
                <p className={cn("text-[13px] mt-1", style.subtitleText)}>{style.subtitle}</p>
              </div>

              {/* Credits */}
              <div className="rounded-xl border border-foreground/[0.08] p-4 mb-6">
                <div className="text-[15px] font-bold text-foreground mb-0.5">
                  {plan.creditsPerMonth?.toLocaleString()} credits/mo.
                </div>
                {plan.metadata?.[0] && (
                  <div className="text-[12px] mb-3 text-muted-foreground">≈ {plan.metadata[0]}</div>
                )}
                <div className="relative h-1 rounded-full overflow-hidden bg-foreground/[0.08]">
                  <div
                    className={cn("absolute left-0 top-0 h-full rounded-full transition-all duration-500", style.bar)}
                    style={{ width: `${creditsBarPct}%` }}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                {isYearly && discountPct > 0 && (
                  <div className="text-[14px] line-through mb-0.5 text-muted-foreground">${monthlyPrice}</div>
                )}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[38px] font-extrabold text-foreground leading-none">
                    ${averageMonthly % 1 === 0 ? averageMonthly.toFixed(0) : averageMonthly.toFixed(2)}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    per month, billed {isYearly ? "annually" : "monthly"}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isRedirecting || isCurrent}
                className={cn(
                  "w-full py-3 rounded-[10px] text-[14px] font-bold transition-colors disabled:opacity-50 mb-2",
                  style.cta,
                )}
              >
                {isRedirecting ? "Redirecting…" : isCurrent ? "Current plan" : `Get ${plan.name}`}
              </button>

              <div className="text-center text-[12px] mb-6 text-muted-foreground">
                {isYearly && yearlySavings > 0
                  ? `Save $${Math.round(yearlySavings)} compared to monthly`
                  : "No difference compared to monthly"}
              </div>

              {/* Features */}
              <div className="border-t border-foreground/[0.07] pt-5 flex-grow">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4ade80]">
                  Included features
                </span>
                <div className="space-y-2.5 mt-3">
                  {features.map((feature, i) => {
                    const Icon = i === 0 ? Layers : Check;
                    return (
                      <div key={i} className="flex items-start gap-2.5">
                        <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", style.accent)} strokeWidth={2.5} />
                        <span
                          className={cn(
                            "text-[13px] leading-snug",
                            i === 0 ? "font-semibold text-foreground" : "text-foreground/75",
                          )}
                        >
                          {feature}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Free tier */}
      <div className="max-w-[1000px] mx-auto px-4 mt-5 pb-4">
        <div className="rounded-2xl border border-foreground/[0.08] p-7 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col text-left min-w-[140px]">
            <div className="text-[16px] font-bold mb-1 text-foreground">Free Plan</div>
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-bold text-foreground">$0</span>
              <span className="text-[14px] text-muted-foreground">/mo</span>
            </div>
          </div>

          <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-muted-foreground">
              One-Time Credits
            </div>
            <div className="text-[16px] font-bold mb-3 text-foreground">50 credits</div>
            <div className="flex flex-col md:flex-row gap-3 md:gap-6">
              {[
                concurrencyLabel(freePlan?.maxConcurrentJobs),
                "Access to basic generation",
                "Standard quality outputs",
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#4ade80]" strokeWidth={2.25} />
                  <span className="text-[13px] text-foreground/75">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[12px] flex-shrink-0 text-muted-foreground">No credit card required</div>
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
