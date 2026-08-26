"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Model } from "@/features/generation/enums/models.enum";

interface ModelRowProps {
  model: Model;
  isActive?: boolean;
  onSelect?: () => void;
  /** Wrap in a clickable button instead of a plain div. */
  asButton?: boolean;
  /** Tighter sizing for dense lists such as the navbar launcher. */
  compact?: boolean;
}

/**
 * The icon tile + name + description row shared by the composer's ModelSelector
 * and the navbar media-type launcher.
 */
export function ModelRow({
  model,
  isActive,
  onSelect,
  asButton = false,
  compact = false,
}: ModelRowProps) {
  const content = (
    <>
      <div
        className={cn(
          "bg-accent relative flex shrink-0 items-center justify-center rounded-md",
          compact ? "h-9 w-9 text-lg" : "h-12 w-12 text-2xl",
        )}
      >
        {model.svg}
      </div>
      <div className="flex flex-1 flex-col justify-center text-left">
        <span
          className={cn(
            "text-foreground font-semibold",
            compact ? "text-sm" : "text-md font-bold",
          )}
        >
          {model.name}
        </span>
        {model.description && (
          <span
            className={cn(
              "text-muted-foreground leading-snug",
              compact ? "mt-0.5 text-[11px]" : "mt-1 text-xs",
            )}
          >
            {model.description}
          </span>
        )}
      </div>
      {isActive && <Check className="text-primary mt-1 size-4 shrink-0" />}
    </>
  );

  if (!asButton) {
    return <div className="flex w-full items-start gap-3 p-1">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "hover:bg-accent flex w-full cursor-pointer items-start rounded-lg text-left transition-colors",
        compact ? "gap-2.5 p-2" : "gap-3 p-2",
        isActive && "bg-accent",
      )}
    >
      {content}
    </button>
  );
}
