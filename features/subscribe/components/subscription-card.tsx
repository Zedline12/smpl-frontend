"use client";

import { SubscriptionPlan } from "@/lib/types/subscription-plan.type";
import { useCheckout } from "../hooks/use-checkout";
import { useAuth } from "@/providers/AuthProvider";
interface SubscriptionCardProps {
  plan: SubscriptionPlan;
}

export function SubscriptionCard({ plan }: SubscriptionCardProps) {
  const { user } = useAuth();
  const { startCheckout, isLoading } = useCheckout();


  // const isPremiumOrPro = !isBasic && !isStandard;

  return (
    <div
      className={`relative rounded-2xl p-8 border hover:shadow-xl transition-all duration-300 flex flex-col h-full  overflow-hidden group border-neutral-700/50 hover:bg-background-light bg-transparent ${plan.isMostPopular ? "border-primary/50" : ""}`}
    >
      {plan.isMostPopular && (
        <div className="bg-gradient-primary text-primary-foreground w-fit text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg border border-white/20 mb-4">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Most Popular
        </div>
      )}
      <div className="mb-6 relative">
        <h3 className="font-extrabold mb-2 transition-all duration-300 text-2xl text-primary-foreground">
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-primary-foreground">
            {plan.priceAmount}$
          </span>
          <span className="text-muted-foreground text-sm">
            /{plan.billingPeriod === "MONTHLY" ? "mo" : "yr"}
          </span>
        </div>
      </div>

      <div className="flex-grow space-y-4 mb-8">
        <div className="flex items-start gap-3 text-muted-foreground">
          <svg
            className="w-5 h-5 text-green-500 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{plan.creditsPerMonth} Credits / Month</span>
        </div>
      </div>

      <button
        onClick={() => startCheckout(plan.id)}
        disabled={isLoading || user?.subscription?.id === plan.id}
        className={`w-full py-3 px-6 rounded-xl font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-primary-foreground ${
          plan.isMostPopular
            ? "bg-gradient-primary border-none"
            :"bg-transparent border border-neutral-700 hover:bg-background-light"
        }`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : user?.subscription?.id === plan.id ? (
          "Subscribed"
        ) : (
          "Subscribe"
        )}
      </button>
    </div>
  );
}
