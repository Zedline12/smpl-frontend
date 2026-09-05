"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  brandThemeKeys,
  useBrandThemeQueuesQuery,
  useBrandThemesQuery,
  useCreateBrandThemeMutation,
  useCreateManualBrandThemeMutation,
  useDeleteBrandThemeMutation,
} from "../hooks/use-brand-themes";
import { isActiveStatus } from "../types";
import { BrandThemeGrid } from "./BrandThemeGrid";
import { CreateBrandThemeForm } from "./CreateBrandThemeForm";
import { CreateManualBrandThemeForm } from "./CreateManualBrandThemeForm";

export function BrandThemesWorkspace() {
  const queryClient = useQueryClient();

  const { data: themes, isLoading, isError, error, refetch } =
    useBrandThemesQuery();
  const { data: queues } = useBrandThemeQueuesQuery();
  const createTheme = useCreateBrandThemeMutation();
  const createManualTheme = useCreateManualBrandThemeMutation();
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
          websiteUrl: theme.websiteUrl,
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
      <header>
        <h1 className="text-foreground text-2xl font-bold">Brand Themes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Pull a brand&apos;s colours, fonts and logo straight from its website.
        </p>
      </header>

      <Tabs defaultValue="website">
        <TabsList className="bg-background-light h-10 gap-1 rounded-xl p-1">
          <TabsTrigger
            value="website"
            className="cursor-pointer rounded-lg text-xs sm:text-sm data-[state=active]:shadow-none"
          >
            From website
          </TabsTrigger>
          <TabsTrigger
            value="manual"
            className="cursor-pointer rounded-lg text-xs sm:text-sm data-[state=active]:shadow-none"
          >
            Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="website" className="mt-3">
          <CreateBrandThemeForm
            onSubmit={(values) => createTheme.mutate(values)}
            isSubmitting={createTheme.isPending}
          />
        </TabsContent>

        <TabsContent value="manual" className="mt-3">
          <CreateManualBrandThemeForm
            onSubmit={(values) => createManualTheme.mutate(values)}
            isSubmitting={createManualTheme.isPending}
          />
        </TabsContent>
      </Tabs>

      {/* <BrandThemeGrid
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
      /> */}
    </div>
  );
}
