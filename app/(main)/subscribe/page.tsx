"use client";

import { useState } from "react";
import { billingPeriod } from "@/lib/types/subscription-plan.type";
import { useSubscriptionPlans } from "@/features/subscribe/hooks/use-subscription-plans";
import { SubscriptionToggle } from "@/features/subscribe/components/subscription-toggle";
import { SubscriptionGrid } from "@/features/subscribe/components/subscription-grid";

export default function SubscribePage() {
  const [period, setPeriod] = useState<billingPeriod>(billingPeriod.MONTHLY);
  const { plans, isLoading, error } = useSubscriptionPlans(period);

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
          Subscription Plans
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Choose the perfect plan for your needs. Upgrade or downgrade at any
          time.
        </p>
      </div>

      <SubscriptionToggle period={period} onChange={setPeriod} />

      {error ? (
        <div className="text-center p-4 bg-red-50 text-red-600 rounded-lg">
          <p>Error loading plans: {error}</p>
          <p className="text-sm mt-2">Please try again later.</p>
        </div>
      ) : (
        <SubscriptionGrid plans={plans} isLoading={isLoading} />
      )}
    </div>
  );
}
