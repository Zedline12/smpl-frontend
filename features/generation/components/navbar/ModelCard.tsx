"use client";

import { Model } from "@/features/generation/enums/models.enum";
import { ModelRow } from "@/features/generation/components/ModelRow";

interface ModelCardProps {
  models: Model[];
  onSelect: (model: Model) => void;
}

export function ModelCard({ models, onSelect }: ModelCardProps) {
  return (
    <div className="border-border bg-popover absolute top-full left-0 mt-2 w-[460px] rounded-2xl border p-3 shadow-lg">
      <p className="text-muted-foreground px-2 pt-1 pb-2 text-[11px] font-semibold tracking-wider uppercase">
        Features
      </p>

      <div className="custom-scrollbar max-h-[70vh] space-y-1 overflow-y-auto">
        {models.map((model) => (
          <ModelRow
            key={model.id}
            model={model}
            onSelect={() => onSelect(model)}
            asButton
            compact
          />
        ))}
      </div>
    </div>
  );
}
