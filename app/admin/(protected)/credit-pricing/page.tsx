import { Suspense } from "react";
import { fetchWithToken } from "@/lib/fetcher";
import { CreditPricingStudio } from "@/features/admin/credit-pricing/components/CreditPricingStudio";

export default async function CreditPricingPage() {
  // Allowed params and saved rules feed the "edit individual options" table.
  const [modelsRes, rulesRes] = await Promise.all([
    fetchWithToken("/credit-pricing/models").then((res) => res.json()),
    fetchWithToken("/credit-pricing").then((res) => res.json()),
  ]);

  return (
    <div className="p-6">
      <Suspense>
        <CreditPricingStudio schema={modelsRes?.data || {}} rules={rulesRes?.data || []} />
      </Suspense>
    </div>
  );
}
