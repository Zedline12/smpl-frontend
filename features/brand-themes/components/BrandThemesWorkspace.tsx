"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  brandThemeKeys,
  useBrandThemeQueuesQuery,
  useBrandThemesQuery,
  useDeleteBrandThemeMutation,
} from "../hooks/use-brand-themes";
import { isActiveStatus } from "../types";
import { BrandThemeGrid } from "./BrandThemeGrid";

export function BrandThemesWorkspace() {
  const queryClient = useQueryClient();

  const { data: themes, isLoading, isError, error, refetch } =
    useBrandThemesQuery();
  const { data: queues } = useBrandThemeQueuesQuery();
  const deleteTheme = useDeleteBrandThemeMutation();

  // A ref, not state: the effect below depends only on `queues`, so a state Set
  // would be stale on every run and the same job could be handled twice.
  const handled = useRef(new Set<string>());

  /**
   * The themes list is the source of truth for what renders — a just-created
   * theme is already in it (POST returns it) and carries the websiteUrl, so
   * rendering from the queues too would duplicate the card. The queues only
   * drive the poll cadence, the completion toasts, and a fresher status when a
   * job can be linked back to its theme.
   */
  const { extracting, finished } = useMemo(() => {
    const list = themes ?? [];
    const jobByThemeId = new Map(
      (queues ?? [])
        .filter((job) => job.brandThemeId)
        .map((job) => [job.brandThemeId as string, job]),
    );

    return {
      extracting: list
        .filter((theme) => isActiveStatus(theme.status))
        .map((theme) => ({
          id: theme.id,
          status: jobByThemeId.get(theme.id)?.status ?? theme.status,
          websiteUrl: theme.websiteUrl ?? undefined,
        })),
      finished: list.filter((theme) => !isActiveStatus(theme.status)),
    };
  }, [themes, queues]);

  useEffect(() => {
    if (!queues?.length) return;

    let succeeded = 0;
    let failed = 0;

    queues.forEach((job) => {
      if (isActiveStatus(job.status) || handled.current.has(job.id)) return;
      handled.current.add(job.id);
      if (job.status === "success") succeeded += 1;
      if (job.status === "failure") failed += 1;
    });

    if (!succeeded && !failed) return;

    // One toast per batch, not per job.
    if (succeeded) {
      toast.success(
        succeeded === 1
          ? "Brand theme ready"
          : `${succeeded} brand themes ready`,
      );
    }
    if (failed) {
      toast.error(
        failed === 1
          ? "A brand theme extraction failed"
          : `${failed} brand theme extractions failed`,
      );
    }

    queryClient.invalidateQueries({ queryKey: brandThemeKeys.all });
  }, [queues, queryClient]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-5 md:p-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Brand Themes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your brands&apos; colours, fonts and logos, ready to use in Marketing
            Studio.
          </p>
        </div>
        <Link
          href="/marketing-studio/brand-themes/create"
          className="bg-gradient-primary flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          New theme
        </Link>
      </header>

      <BrandThemeGrid
        themes={finished}
        activeJobs={extracting}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        deletingId={
          deleteTheme.isPending ? (deleteTheme.variables as string) : undefined
        }
        onDelete={(id) => deleteTheme.mutate(id)}
      />
    </div>
  );
}
