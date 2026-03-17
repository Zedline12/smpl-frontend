import { fetchWithToken } from "@/lib/fetcher";
import { SubscriptionPlan } from "@/lib/types/subscription-plan.type";
import { SubscriptionPlansTable } from "@/features/admin/subscriptions/components/SubscriptionPlansTable";

export default async function SubscriptionsPage() {
  const json = await fetchWithToken("/subscription-plans").then((res) =>
    res.json(),
  );
  
  const plans: SubscriptionPlan[] = json.data;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Subscription Plans</h1>
      </div>
      <SubscriptionPlansTable plans={plans} />
    </div>
  );
}