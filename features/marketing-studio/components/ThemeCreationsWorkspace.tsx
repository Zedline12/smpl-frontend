"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useBrandThemesQuery } from "@/features/brand-themes/hooks/use-brand-themes";
import {
  useMarketingCreationsQuery,
  useMarketingQueuesQuery,
} from "../hooks/use-marketing-studio";
import { MyCreationCard } from "./MyCreationCard";

export function ThemeCreationsWorkspace({
  brandThemeId,
}: {
  brandThemeId: string;
}) {
  const { data: themes } = useBrandThemesQuery();
  const theme = themes?.find((t) => t.id === brandThemeId);

  const {
    data: rawCreations,
    isLoading,
    isError,
    error,
    refetch,
  } = useMarketingCreationsQuery({ brandThemeId });
  const { data: queue } = useMarketingQueuesQuery();

  const creations = useMemo(() => {
    if (!rawCreations) return rawCreations;
    if (!queue?.length) return rawCreations;
    const byId = new Map(queue.map((job) => [job.id, job]));
    return rawCreations.map((creation) => byId.get(creation.id) ?? creation);
  }, [rawCreations, queue]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-5 md:p-8">
      <div>
        <Link
          href="/marketing-studio/my-creations"
          className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          My Creations
        </Link>

        <header className="flex items-center gap-3">
          {theme?.logoUrl ? (
            <img
              src={theme.logoUrl}
              alt=""
              className="border-border bg-background-light size-11 shrink-0 rounded-xl border object-contain p-1"
            />
          ) : (
            <div className="border-border bg-background-light text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-xl border text-base font-bold uppercase">
              {(theme?.name || "?").charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-foreground text-2xl font-bold">
              {theme?.name?.trim() || "Untitled theme"}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              {theme?.primaryColor && (
                <span
                  className="size-3.5 shrink-0 rounded-full border border-white/20"
                  style={{ background: theme.primaryColor }}
                />
              )}
              <p className="text-muted-foreground text-sm">
                Every ad and photo generated for this brand theme.
              </p>
            </div>
          </div>
        </header>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="border-border bg-card animate-pulse overflow-hidden rounded-2xl border"
            >
              <div className="bg-background-lighter aspect-square" />
              <div className="p-3">
                <div className="bg-background-lighter h-3 w-3/4 rounded" />
                <div className="bg-background-light mt-2 h-2.5 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center">
          <p className="text-muted-foreground text-sm">
            {error instanceof Error
              ? error.message
              : "Could not load this theme's creations."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-ghost btn-sm"
          >
            Try again
          </button>
        </div>
      ) : !creations?.length ? (
        <div className="border-border bg-card rounded-2xl border border-dashed py-16 text-center">
          <div className="bg-muted text-muted-foreground mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
            <Sparkles className="size-8" />
          </div>
          <h3 className="text-foreground text-lg font-semibold">
            No creations yet
          </h3>
          <p className="text-muted-foreground mt-1 mb-6 text-sm">
            Generate your first branded ad or photo for this theme.
          </p>
          <Link href="/marketing-studio/create" className="btn btn-primary">
            Create
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creations.map((creation) => (
            <MyCreationCard key={creation.id} creation={creation} />
          ))}
        </div>
      )}
    </div>
  );
}
