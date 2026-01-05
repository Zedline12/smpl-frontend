"use client";

import { billingPeriod } from "@/lib/types/subscription-plan.type";

interface SubscriptionToggleProps {
  period: billingPeriod;
  onChange: (period: billingPeriod) => void;
}

export function SubscriptionToggle({
  period,
  onChange,
}: SubscriptionToggleProps) {
  return (
    <div className="flex justify-center mb-10">
      <div className="bg-gray-100 p-1 rounded-full inline-flex items-center relative">
        <button
          onClick={() => onChange(billingPeriod.MONTHLY)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            period === billingPeriod.MONTHLY
              ? "bg-white text-black shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => onChange(billingPeriod.YEARLY)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            period === billingPeriod.YEARLY
              ? "bg-white text-black shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Yearly
        </button>
      </div>
    </div>
  );
}
