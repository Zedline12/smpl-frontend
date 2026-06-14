"use client";

import { ModelCostTable, ModelCostRule } from "./ModelCostTable";

export type ModelsSchema = Record<string, Record<string, any[]>>;

export function ModelCostsTables({
  schema,
  rules = [],
}: {
  schema: ModelsSchema;
  rules?: ModelCostRule[];
}) {
  const modelKeys = Object.keys(schema);

  if (modelKeys.length === 0) {
    return <div className="text-neutral-400">No model cost schemas found.</div>;
  }

  const rulesByModel = rules.reduce(
    (acc, rule) => {
      if (!acc[rule.model]) acc[rule.model] = [];
      acc[rule.model].push(rule);
      return acc;
    },
    {} as Record<string, ModelCostRule[]>,
  );

  return (
    <div className="space-y-12">
      {modelKeys.map((modelId) => (
        <div key={modelId} className="space-y-4">
          <ModelCostTable
            modelId={modelId}
            modelSchema={schema[modelId]}
            existingRules={rulesByModel[modelId] || []}
          />
        </div>
      ))}
    </div>
  );
}
