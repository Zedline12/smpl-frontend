"use server";

import { SubscriptionGrid } from "@/features/subscribe/components/subscription-grid";
import { fetchWithToken } from "@/lib/fetcher";

export default async function SubscribePage() {
  const json = await fetchWithToken("/subscription-plans").then((d) =>
    d.json(),
  );
  const subscriptionPlans = json.data;

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight">
          Subscription Plans
        </h1>
        <p className="text-xl text-secondary-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your needs. Upgrade or downgrade at any
          time.
        </p>
      </div>

      {json.error ? (
        <div className="text-center p-4 bg-red-50 text-red-600 rounded-lg">
          <p>Error loading plans: {json.error}</p>
          <p className="text-sm mt-2">Please try again later.</p>
        </div>
      ) : (
        <SubscriptionGrid plans={subscriptionPlans} isLoading={false} />
      )}
    </div>
  );
}
