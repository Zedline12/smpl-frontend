"use client";
import { useEffect, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectsQuery } from "@/features/projects/hooks/projects";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";

/** One column of the settings panel. */
export function StudioCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col rounded-3xl border border-white/[0.07] bg-black/30 p-5 sm:p-6", className)}>
      {children}
    </div>
  );
}

/**
 * Generations need a project; there's no picker on this page, so use the first one
 * (what the project picker elsewhere defaults to).
 */
function useDefaultProject(enabled: boolean) {
  const { projectId, setProjectId } = useAiGenerationControlStore();
  const { data: projects = [] } = useProjectsQuery();
  useEffect(() => {
    if (enabled && !projectId && projects.length > 0) setProjectId(projects[0].id);
  }, [enabled, projects, projectId, setProjectId]);
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
}: {
  label: string;
  credits: number;
  onClick: () => void;
  disabled: boolean;
  hint?: string | null;
  needsProject: boolean;
  className?: string;
}) {
  useDefaultProject(needsProject);
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
        <span className="text-xs font-medium text-white/70">· {credits} credits</span>
      </button>
    </div>
  );
}
