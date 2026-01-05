import { SubscriptionPlan } from "@/lib/types/subscription-plan.type";
import { SubscriptionCard } from "./subscription-card";

interface SubscriptionGridProps {
  plans: SubscriptionPlan[];
  isLoading: boolean;
}

export function SubscriptionGrid({ plans, isLoading }: SubscriptionGridProps) {
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

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
      {plans.map((plan) => (
        <SubscriptionCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
