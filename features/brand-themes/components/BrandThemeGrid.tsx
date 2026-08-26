"use client";

import { Palette } from "lucide-react";
import { BrandTheme, BrandThemeQueue } from "../types";
import { BrandThemeCard } from "./BrandThemeCard";
import { ExtractingCard } from "./ExtractingCard";

interface BrandThemeGridProps {
  themes: BrandTheme[];
  activeJobs: BrandThemeQueue[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  deletingId?: string;
  onDelete: (id: string) => void;
}

export function BrandThemeGrid({
  themes,
  activeJobs,
  isLoading,
  isError,
  error,
  onRetry,
  deletingId,
  onDelete,
}: BrandThemeGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border-border bg-card animate-pulse rounded-2xl border p-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-background-lighter size-11 rounded-xl" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="bg-background-lighter h-3 w-1/2 rounded" />
                <div className="bg-background-light h-2.5 w-1/3 rounded" />
              </div>
            </div>
            <div className="bg-background-light mt-5 h-7 w-2/3 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center">
        <p className="text-muted-foreground text-sm">
          {error instanceof Error
            ? error.message
            : "Could not load your brand themes."}
        </p>
        <button type="button" onClick={onRetry} className="btn btn-ghost btn-sm">
          Try again
        </button>
      </div>
    );
  }

  if (!activeJobs.length && !themes.length) {
    return (
      <div className="border-border bg-card rounded-2xl border border-dashed py-16 text-center">
        <div className="bg-muted text-muted-foreground mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
          <Palette className="size-8" />
        </div>
        <h3 className="text-foreground text-lg font-semibold">
          No brand themes yet
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Paste a website above to extract its colours, fonts and logo.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {activeJobs.map((job) => (
        <ExtractingCard key={job.id} job={job} />
      ))}

      {themes.map((theme) => (
        <BrandThemeCard
          key={theme.id}
          theme={theme}
          isDeleting={deletingId === theme.id}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
