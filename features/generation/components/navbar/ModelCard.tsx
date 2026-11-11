"use client";

import { Model } from "@/features/generation/enums/models.enum";
import { ModelRow } from "@/features/generation/components/ModelRow";

interface ModelCardProps {
  models: Model[];
  onSelect: (model: Model) => void;
  /** Screen position (fixed); the navbar scrolls sideways and would clip an absolute card. */
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function ModelCard({ models, onSelect, style, onMouseEnter, onMouseLeave }: ModelCardProps) {
  return (
    <div
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="border-border bg-popover fixed z-[90] w-[min(460px,calc(100vw-24px))] rounded-2xl border p-3 shadow-lg"
    >
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
