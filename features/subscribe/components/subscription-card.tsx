"use client";

import { SubscriptionPlan } from "@/lib/types/subscription-plan.type";
import { subscriptionPlansService } from "@/lib/api/services/subscription-plans.service";
import { useState } from "react";
import { useCheckout } from "../hooks/use-checkout";

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
}

export function SubscriptionCard({ plan }: SubscriptionCardProps) {
  const { startCheckout, isLoading } = useCheckout();

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-gray-900">
            {plan.priceAmount}
            {plan.currency}
          </span>
          <span className="text-gray-500 text-sm">
            /{plan.billingPeriod === "MONTHLY" ? "mo" : "yr"}
          </span>
        </div>
      </div>

      <div className="flex-grow space-y-4 mb-8">
        <div className="flex items-start gap-3 text-gray-600">
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
        disabled={isLoading}
        className="w-full py-3 px-6 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        ) : (
          "Subscribe"
        )}
      </button>
    </div>
  );
}
