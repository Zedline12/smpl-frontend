import type { Metadata } from "next";
import { SubscriptionGrid } from "@/features/subscribe/components/subscription-grid";
import { fetchWithToken } from "@/lib/fetcher";

export const metadata: Metadata = { title: "Pricing" };

export default async function PricingPage() {
  const json = await fetchWithToken("/subscription-plans").then((d) =>
    d.json(),
  );
  const subscriptionPlans = json.data;
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-16 pb-10 text-center px-4">
        <h1 className="text-[44px] md:text-[56px] font-extrabold text-white tracking-tight leading-none mb-3">
          Pricing
        </h1>
        <p className="text-[16px] max-w-md mx-auto" style={{ color: "var(--fg-3)" }}>
          Simple pricing. Cancel anytime.
        </p>
      </div>

      {json.error ? (
        <div className="text-center p-4 text-red-400 max-w-md mx-auto">
          <p>Error loading plans: {json.error}</p>
          <p className="text-sm mt-2">Please try again later.</p>
        </div>
      ) : (
        <SubscriptionGrid plans={subscriptionPlans} isLoading={false} />
      )}
    </div>
  );
}
