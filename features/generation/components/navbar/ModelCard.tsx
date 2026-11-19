"use client";

import { Model } from "@/features/generation/enums/models.enum";
import { ModelRow } from "@/features/generation/components/ModelRow";
import { useCatalog } from "@/features/catalog/catalog";

interface ModelCardProps {
  models: Model[];
  onSelect: (model: Model) => void;
  /** Screen position (fixed); the navbar scrolls sideways and would clip an absolute card. */
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/** The launcher's menu: our generators, third-party models and tools, in sections. */
export function ModelCard({ models, onSelect, style, onMouseEnter, onMouseLeave }: ModelCardProps) {
  const { withCatalog, groupByKind } = useCatalog();
  const sections = groupByKind(withCatalog(models));

  return (
    <div
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="border-border bg-popover fixed z-[90] w-[min(460px,calc(100vw-24px))] rounded-2xl border p-3 shadow-lg"
    >
      <div className="custom-scrollbar max-h-[70vh] space-y-3 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.kind}>
            <p className="text-muted-foreground px-2 pt-1 pb-2 text-[11px] font-semibold tracking-wider uppercase">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((model) => (
                <ModelRow key={model.id} model={model} onSelect={() => onSelect(model)} asButton compact />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
