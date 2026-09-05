"use client";

import { cn } from "@/lib/utils";
import { MarketingStudioMediaType } from "../types";

const OPTIONS: { value: MarketingStudioMediaType; label: string }[] = [
  { value: "photo", label: "Photo" },
  { value: "video", label: "Video" },
];

interface MediaTypeToggleProps {
  value: MarketingStudioMediaType;
  onChange: (value: MarketingStudioMediaType) => void;
}

export function MediaTypeToggle({ value, onChange }: MediaTypeToggleProps) {
  return (
    <div className="bg-background-light inline-flex items-center gap-1 rounded-lg p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === option.value
              ? "bg-background-lightest text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
