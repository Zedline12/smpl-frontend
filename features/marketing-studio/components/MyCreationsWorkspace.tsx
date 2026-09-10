"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useBrandThemesQuery } from "@/features/brand-themes/hooks/use-brand-themes";
import {
  useMarketingCreationsQuery,
  useMarketingQueuesQuery,
} from "../hooks/use-marketing-studio";
import { ThemeCreationsCard } from "./ThemeCreationsCard";

export function MyCreationsWorkspace() {
  const { data: themes } = useBrandThemesQuery();
  const {
    data: rawCreations,
    isLoading,
    isError,
    error,
    refetch,
  } = useMarketingCreationsQuery();
  const { data: queue } = useMarketingQueuesQuery();

  // Overlay the 1s queue poll on top of the 30s list fetch so a creation's
  // media appears as soon as it's ready, without waiting on the list's own
  // refetch.
  const creations = useMemo(() => {
    if (!rawCreations) return rawCreations;
    if (!queue?.length) return rawCreations;
    const byId = new Map(queue.map((job) => [job.id, job]));
    return rawCreations.map((creation) => byId.get(creation.id) ?? creation);
  }, [rawCreations, queue]);

  const themeGroups = useMemo(() => {
    if (!creations || !themes) return null;
    const byThemeId = new Map<string, typeof creations>();
    for (const creation of creations) {
      const group = byThemeId.get(creation.brandThemeId);
      if (group) group.push(creation);
      else byThemeId.set(creation.brandThemeId, [creation]);
    }
    return Array.from(byThemeId.entries())
      .map(([themeId, themeCreations]) => ({
        theme: themes.find((t) => t.id === themeId),
        creations: themeCreations,
      }))
      .filter((group) => !!group.theme);
  }, [creations, themes]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-5 md:p-8">
      <header>
        <h1 className="text-foreground text-2xl font-bold">My Creations</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Every ad and photo you&apos;ve generated, grouped by brand theme.
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-background-lighter w-[42%] h-6 rounded-t-lg" />
              <div className="border-border bg-card -mt-px rounded-xl rounded-tl-none border p-5">
                <div className="bg-background-lighter h-9 w-9 rounded-lg" />
                <div className="bg-background-lighter mt-4 h-3 w-1/2 rounded" />
                <div className="bg-background-light mt-3 h-2.5 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center">
          <p className="text-muted-foreground text-sm">
            {error instanceof Error
              ? error.message
              : "Could not load your creations."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-ghost btn-sm"
          >
            Try again
          </button>
        </div>
      ) : !themeGroups?.length ? (
        <div className="border-border bg-card rounded-2xl border border-dashed py-16 text-center">
          <div className="bg-muted text-muted-foreground mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
            <Sparkles className="size-8" />
          </div>
          <h3 className="text-foreground text-lg font-semibold">
            No creations yet
          </h3>
          <p className="text-muted-foreground mt-1 mb-6 text-sm">
            Generate your first branded ad or photo.
          </p>
          <Link href="/marketing-studio/create" className="btn btn-primary">
            Create
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {themeGroups.map(({ theme, creations }) => (
            <Link
              key={theme!.id}
              href={`/marketing-studio/my-creations/${theme!.id}`}
            >
              <ThemeCreationsCard theme={theme!} creations={creations} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
