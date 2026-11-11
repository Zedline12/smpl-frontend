"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLiveStore } from "./store";

export interface ProgressInput {
  status: string;
  createdAt?: string | Date | null;
  startedAt?: string | Date | null;
  estimatedSeconds?: number | null;
  /** Provider finished, the file is being saved. */
  saving?: boolean;
}

export interface JobProgressState {
  /** 0–1 */
  fraction: number;
  label: string;
  remainingSeconds: number | null;
  overdue: boolean;
  queued: boolean;
}

function formatLeft(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s ? `${m}:${String(s).padStart(2, "0")}` : `${m} min`;
}

/** Re-renders every `ms` while `active`. */
function useNow(active: boolean, ms = 500) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [active, ms]);
  return now;
}

/**
 * Progress from the expected duration: fills with time spent, holds at 95% until
 * the job really finishes, and says so if it's taking longer than usual.
 */
export function useJobProgress(job: ProgressInput): JobProgressState {
  const offset = useLiveStore((s) => s.clockOffsetMs);
  const active = job.status === "pending" || job.status === "processing";
  const now = useNow(active) + offset;

  if (job.status === "success" || job.saving) {
    return { fraction: job.saving ? 0.97 : 1, label: job.saving ? "Saving…" : "Done", remainingSeconds: 0, overdue: false, queued: false };
  }
  if (job.status === "failure") {
    return { fraction: 1, label: "Failed", remainingSeconds: null, overdue: false, queued: false };
  }
  if (job.status === "pending" || !job.startedAt) {
    return { fraction: 0.02, label: "In queue", remainingSeconds: null, overdue: false, queued: true };
  }

  const elapsed = Math.max(0, (now - new Date(job.startedAt).getTime()) / 1000);
  const estimate = job.estimatedSeconds && job.estimatedSeconds > 0 ? job.estimatedSeconds : null;
  if (!estimate) {
    // No estimate: slow approach to 90% so it still feels alive.
    return { fraction: 0.9 * (1 - Math.exp(-elapsed / 60)), label: "Generating…", remainingSeconds: null, overdue: false, queued: false };
  }
  const ratio = elapsed / estimate;
  if (ratio < 1) {
    return {
      fraction: Math.max(0.03, Math.min(0.95, ratio * 0.95)),
      label: `About ${formatLeft(estimate - elapsed)} left`,
      remainingSeconds: estimate - elapsed,
      overdue: false,
      queued: false,
    };
  }
  // Over the estimate: creep from 95% toward 99%.
  return {
    fraction: 0.95 + 0.04 * (1 - Math.exp(-(ratio - 1) * 2)),
    label: "Taking a bit longer than usual…",
    remainingSeconds: 0,
    overdue: true,
    queued: false,
  };
}

/** A thin progress bar with its "About 1:20 left" label. */
export function JobProgress({
  job,
  className,
  showLabel = true,
  size = "md",
}: {
  job: ProgressInput;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}) {
  const p = useJobProgress(job);
  return (
    <div className={cn("w-full", className)}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(p.fraction * 100)}
        aria-label={p.label}
        className={cn("w-full overflow-hidden rounded-full bg-white/10", size === "sm" ? "h-1" : "h-1.5")}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            job.status === "failure" ? "bg-red-400" : p.queued ? "animate-pulse bg-white/30" : "bg-primary",
          )}
          style={{ width: `${Math.round(p.fraction * 100)}%` }}
        />
      </div>
      {showLabel && (
        <p className={cn("mt-1.5 text-[11px]", p.overdue ? "text-amber-300/80" : "text-white/50")}>{p.label}</p>
      )}
    </div>
  );
}
