import { fetchWithToken } from "@/lib/fetcher";
import { CreditPricingTables } from "@/features/admin/credit-pricing/components/CreditPricingTables";

export const normalizeValue = (value: any) => {
  if (value === "true") return true;
  if (value === "false") return false;
  if (!isNaN(value)) return Number(value);
  return value;
};

export default async function CreditPricingPage() {
  const [modelsRes, rulesRes] = await Promise.all([
    fetchWithToken("/credit-pricing/models").then((res) => res.json()),
    fetchWithToken("/credit-pricing").then((res) => res.json()),
  ]);

  let modelsSchema = modelsRes?.data || {};
  const rules = rulesRes?.data || [];

  return (
    <div className="p-6 ">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-primary-foreground">
          Credit Pricing Management
        </h1>
      </div>

      <div className="flex justify-between items-center mb-10 mt-8">
        <h2 className="text-xl font-bold text-white">Configured Pricing Models</h2>
      </div>
      <CreditPricingTables schema={modelsSchema} rules={rules} />
    </div>
  );
}
