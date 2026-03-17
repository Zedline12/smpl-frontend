"use client";
import {
  billingPeriod,
  SubscriptionPlan,
} from "@/lib/types/subscription-plan.type";
import { SubscriptionCard } from "./subscription-card";
import { useState } from "react";
import { SubscriptionToggle } from "./subscription-toggle";

interface SubscriptionGridProps {
  plans: SubscriptionPlan[];
  isLoading: boolean;
}

export function SubscriptionGrid({ plans, isLoading }: SubscriptionGridProps) {
  const [period, setPeriod] = useState<billingPeriod>(billingPeriod.MONTHLY);
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-50 rounded-2xl h-96 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!plans?.length) {
    return (
      <div className="text-center py-20 text-gray-500">
        No plans available at the moment.
      </div>
    );
  }

  const filteredPlans = plans.filter((plan) => plan.billingPeriod === period);

  return (
    <>
      <SubscriptionToggle period={period} onChange={setPeriod} />
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4  ">
        {filteredPlans.map((plan) => (
          <SubscriptionCard key={plan.id} plan={plan} />
        ))}
      </div>
    </>
  );
}
