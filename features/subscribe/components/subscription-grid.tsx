"use client";

import { billingPeriod, SubscriptionPlan } from "@/lib/types/subscription-plan.type";
import { useState } from "react";
import { useCheckout } from "../hooks/use-checkout";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface SubscriptionGridProps {
  plans: SubscriptionPlan[];
  isLoading: boolean;
}

export function SubscriptionGrid({ plans, isLoading }: SubscriptionGridProps) {
  const [period, setPeriod] = useState<billingPeriod>(billingPeriod.YEARLY);
  const { user } = useAuth();
  const { startCheckout, isLoading: isCheckoutLoading } = useCheckout();

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-8 max-w-[960px] mx-auto px-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#1a1a1a] rounded-[16px] border border-[#2a2a2a] h-96 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!plans?.length) {
    return (
      <div className="text-center py-20 text-[#888]">
        No plans available at the moment.
      </div>
    );
  }

  const sortOrder: Record<string, number> = { "basic": 1, "creator": 2, "creator pro": 3 };
  
  const filteredPlans = plans
    .filter((plan) => plan.billingPeriod === period)
    .sort((a, b) => {
       const aName = a.name.toLowerCase();
       const bName = b.name.toLowerCase();
       return (sortOrder[aName] || 99) - (sortOrder[bName] || 99);
    });

  const isYearly = period === billingPeriod.YEARLY;

  return (
    <>
      <div className="flex justify-center items-center gap-4 mb-12">
        <button
          onClick={() => setPeriod(billingPeriod.MONTHLY)}
          className={cn(
            "px-6 py-2 rounded-[999px] border border-[#2a2a2a] text-[15px] font-medium transition-all",
            period === billingPeriod.MONTHLY
              ? "bg-white text-black"
              : "bg-transparent text-[#888] hover:text-white"
          )}
        >
          Monthly
        </button>

        <button
          onClick={() => setPeriod(billingPeriod.YEARLY)}
          className={cn(
            "px-6 py-2 rounded-[999px] border border-[#2a2a2a] text-[15px] font-medium transition-all flex items-center gap-2",
            period === billingPeriod.YEARLY
              ? "bg-white text-black"
              : "bg-transparent text-[#888] hover:text-white"
          )}
        >
          Yearly
          <span
            className="text-white text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundImage: "linear-gradient(to right, #f97316, #a855f7)" }}
          >
            Save 15%
          </span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-[960px] mx-auto px-4">
        {filteredPlans.map((plan) => {
          const isCreatorFeatured = plan.name.toLowerCase() === "creator" || (plan.name.toLowerCase().includes("creator") && !plan.name.toLowerCase().includes("pro"));
          
          const correspondingMonthly = plans.find(p => p.name === plan.name && p.billingPeriod === billingPeriod.MONTHLY);
          const monthlyPrice = correspondingMonthly?.priceAmount || 0;
          
          const averageMonthly = isYearly ? plan.priceAmount / 12 : plan.priceAmount;
          const yearlySavings = isYearly ? (monthlyPrice * 12) - plan.priceAmount : 0;

          return (
            <div key={plan.id} className={cn(
              "relative rounded-[16px] p-8 border flex flex-col items-start text-left h-full transition-all duration-300",
              isCreatorFeatured ? "bg-[#141420] border-[#6366f1]" : "bg-[#1a1a1a] border-[#2a2a2a]"
            )}>
              {isCreatorFeatured && (
                <div 
                  className="absolute -top-3 left-8 text-white text-[12px] font-bold px-3 py-1 rounded-full shadow-lg"
                  style={{ backgroundImage: "linear-gradient(to right, #f97316, #a855f7)" }}
                >
                  ⭐ Most Popular
                </div>
              )}
              
              <h3 className="text-[18px] font-bold mb-4 mt-2">{plan.name}</h3>

              <div className="flex items-baseline gap-2 mb-1">
                {isYearly && yearlySavings > 0 && (
                  <span className="text-xl text-[#555] line-through">${monthlyPrice}/mo</span>
                )}
                <span className="text-[42px] font-bold">
                  ${averageMonthly.toFixed(2).replace(/\.00$/, "")}
                  <span className="text-[20px] font-normal">/mo</span>
                </span>
              </div>

              <div className="h-[60px] flex flex-col justify-start gap-1 mt-2">
                {isYearly && yearlySavings > 0 && (
                  <>
                    <div className="bg-[#1a2e1a] text-[#4ade80] text-[12px] font-semibold px-2 py-0.5 rounded w-fit mb-1">
                      You save ${Math.round(yearlySavings)}/yr
                    </div>
                    <div className="text-[#a855f7] text-[13px] font-medium tracking-tight">
                      ${averageMonthly.toFixed(2).replace(/\.00$/, "")}/mo · billed ${plan.priceAmount.toFixed(2).replace(/\.00$/, "")}/yr
                    </div>
                  </>
                )}
              </div>

              <div className="w-full h-px bg-[#2a2a2a] my-6" />

              <div className="text-[11px] font-bold uppercase text-[#888] tracking-wider mb-2">Monthly Credits</div>
              <div className="text-[22px] font-bold mb-6">{plan.creditsPerMonth?.toLocaleString()} credits</div>

              <div className="space-y-3 mb-8 flex-grow w-full">
                {(plan.metadata || []).map((meta, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#4ade80] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[14px] text-[#ddd] leading-snug">{meta}</span>
                  </div>
                ))}
              </div>

              <div className="w-full mt-auto">
                <button
                  onClick={() => startCheckout(plan.id)}
                  disabled={isCheckoutLoading || user?.subscription?.id === plan.id}
                  className={cn(
                    "w-full py-3 rounded-[8px] font-medium transition-all text-white flex items-center justify-center disabled:opacity-50",
                    isCreatorFeatured 
                      ? "border-none shadow-lg hover:opacity-90"
                      : "bg-transparent border border-[#2a2a2a] hover:bg-[#2a2a2a]"
                  )}
                  style={isCreatorFeatured ? { backgroundImage: "linear-gradient(to right, #f97316, #a855f7)" } : {}}
                >
                  {isCheckoutLoading 
                    ? "Processing..." 
                    : user?.subscription?.id === plan.id 
                      ? "Current Plan" 
                      : "Subscribe"}
                </button>
                <div className="text-[#555] text-[11px] text-center w-full mt-3">Cancel anytime</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="max-w-[960px] mx-auto px-4 mt-8 pb-16">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[16px] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col text-left min-w-[150px]">
             <div className="text-[18px] font-bold mb-1">Free Plan</div>
             <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-bold">$0</span>
                <span className="text-[18px] font-normal text-[#888]">/mo</span>
             </div>
          </div>
          
          <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left">
             <div className="text-[11px] font-bold uppercase text-[#888] tracking-wider mb-2">One-Time Credits</div>
             <div className="text-[18px] font-bold mb-3">50 credits</div>
             
             <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#4ade80]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-[#ddd]">Access to basic generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#4ade80]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-[#ddd]">Standard support</span>
                </div>
             </div>
          </div>

          <div className="flex flex-col items-center flex-shrink-0 min-w-[200px]">
             {!user?.subscription ? (
               <button disabled className="w-[180px] py-3 rounded-[8px] border border-[#2a2a2a] bg-transparent text-[#555] font-medium flex justify-center items-center gap-1 cursor-not-allowed">
                  ✓ Current Plan
               </button>
             ) : (
               <button className="w-[180px] py-3 rounded-[8px] border border-[#2a2a2a] bg-transparent text-[#888] font-medium flex justify-center items-center gap-1 hover:bg-[#2a2a2a] transition-all">
                  Downgrade
               </button>
             )}
             <div className="text-[11px] text-[#555] mt-2">No credit card required</div>
          </div>
        </div>
      </div>
    </>
  );
}
