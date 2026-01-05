import { useState, useEffect } from "react";
import { subscriptionPlansService } from "@/lib/api/services/subscription-plans.service";
import {
  SubscriptionPlan,
  billingPeriod,
} from "@/lib/types/subscription-plan.type";

export function useSubscriptionPlans(period: billingPeriod) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        setIsLoading(true);
        const data = await subscriptionPlansService.getSubscriptionPlans(
          period
        );
        setPlans(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch subscription plans", err);
        setError(err.message || "Failed to load subscription plans");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlans();
  }, [period]);

  return { plans, isLoading, error };
}
