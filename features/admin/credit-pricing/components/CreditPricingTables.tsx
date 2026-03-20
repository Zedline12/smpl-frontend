"use client";

import { ModelPricingTable, CreditPricingRule } from "./ModelPricingTable";

export type ModelsSchema = Record<string, Record<string, any[]>>;

export function CreditPricingTables({
  schema,
  rules = [],
}: {
  schema: ModelsSchema;
  rules?: CreditPricingRule[];
}) {
  const modelKeys = Object.keys(schema);

  if (modelKeys.length === 0) {
    return <div className="text-neutral-400">No model pricing schemas found.</div>;
  }

  // Pre-group rules by model
  const rulesByModel = rules.reduce((acc, rule) => {
    if (!acc[rule.model]) acc[rule.model] = [];
    acc[rule.model].push(rule);
    return acc;
  }, {} as Record<string, CreditPricingRule[]>);

  return (
    <div className="space-y-12">
      {modelKeys.map((modelId) => (
        <div key={modelId} className="space-y-4">
          <h2 className="text-xl font-semibold text-white capitalize">
            {modelId.replace("-", " ")} Pricing
          </h2>
          <ModelPricingTable
            modelId={modelId}
            modelSchema={schema[modelId]}
            existingRules={rulesByModel[modelId] || []}
          />
        </div>
      ))}
    </div>
  );
}
