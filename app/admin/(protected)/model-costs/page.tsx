import { fetchWithToken } from "@/lib/fetcher";
import { ModelCostsTables } from "@/features/admin/model-costs/components/ModelCostsTables";

export default async function ModelCostsPage() {
  const [modelsRes, rulesRes] = await Promise.all([
    fetchWithToken("/model-costs/models").then((res) => res.json()),
    fetchWithToken("/model-costs").then((res) => res.json()),
  ]);

  const modelsSchema = modelsRes?.data || {};
  const rules = rulesRes?.data || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-primary-foreground">
          Model Costs Management
        </h1>
      </div>

      <div className="flex justify-between items-center mb-10 mt-8">
        <h2 className="text-xl font-bold text-white">Configured Cost Rules</h2>
      </div>

      <ModelCostsTables schema={modelsSchema} rules={rules} />
    </div>
  );
}
