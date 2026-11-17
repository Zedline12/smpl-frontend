"use client";
import { type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDefaultProject } from "@/features/projects/hooks/use-default-project";

/** One column of the settings panel. */
export function StudioCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-3xl border border-white/[0.07] bg-black/30 p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The Generate button (primary, like the app's other Generate buttons) and what's still missing. */
export function GenerateButton({
  label,
  credits,
  onClick,
  disabled,
  hint,
  needsProject,
  className,
  compact,
}: {
  label: string;
  credits: number;
  onClick: () => void;
  disabled: boolean;
  hint?: string | null;
  needsProject: boolean;
  className?: string;
  /** The small dock button: icon + credits, the label only for screen readers. */
  compact?: boolean;
}) {
  useDefaultProject(needsProject);
  if (compact)
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={`${label}, ${credits} credits`}
        className={cn(
          "bg-primary hover:bg-primary/90 flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40",
          className,
        )}
      >
        <Sparkles className="size-4" />
        <span className="text-xs tabular-nums">{credits}</span>
      </button>
    );
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {hint && <p className="text-xs text-white/45">{hint}</p>}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="bg-primary hover:bg-primary/90 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Sparkles className="size-4" />
        {label}
        <span className="text-xs font-medium text-white/70">
          · {credits} credits
        </span>
      </button>
    </div>
  );
}
