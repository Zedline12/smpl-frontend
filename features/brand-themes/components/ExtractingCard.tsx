"use client";

import { Clock } from "lucide-react";
import { BrandThemeQueue } from "../types";

function hostnameOf(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function ExtractingCard({ job }: { job: BrandThemeQueue }) {
  const host = hostnameOf(job.websiteUrl);
  const isQueued = job.status === "pending";

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-2xl border p-4">
      {/* The sweep. .animate-scanner only sets the transform — the gradient and
          width have to come from here, and the parent must clip it. */}
      {!isQueued && (
        <div
          className="animate-scanner pointer-events-none absolute inset-y-0 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(107, 65, 255, 0.22), transparent)",
          }}
        />
      )}

      <div className="relative flex items-center gap-3">
        <div className="bg-background-lighter size-11 shrink-0 animate-pulse rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-medium">
            {host ?? "Extracting brand theme"}
          </p>
          <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
            {isQueued ? (
              <>
                <Clock className="size-3" />
                Waiting to start
              </>
            ) : (
              "Scanning the site…"
            )}
          </p>
        </div>
      </div>

      {/* Skeleton of the finished layout, so the card visibly becomes the result */}
      <div className="relative mt-4 flex items-center gap-3">
        <div className="bg-background-lighter size-8 animate-pulse rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="bg-background-lighter h-2.5 w-1/2 animate-pulse rounded" />
          <div className="bg-background-light h-2.5 w-1/3 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
