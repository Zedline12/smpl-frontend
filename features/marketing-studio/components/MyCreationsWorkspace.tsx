"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useMarketingCreationsQuery } from "../hooks/use-marketing-studio";
import { MyCreationCard } from "./MyCreationCard";

export function MyCreationsWorkspace() {
  const { data: creations, isLoading, isError, error, refetch } =
    useMarketingCreationsQuery();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-5 md:p-8">
      <header>
        <h1 className="text-foreground text-2xl font-bold">My Creations</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Every ad and photo you&apos;ve generated with Marketing Studio.
        </p>
      </header>

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
      ) : !creations?.length ? (
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creations.map((creation) => (
            <MyCreationCard key={creation.id} creation={creation} />
          ))}
        </div>
      )}
    </div>
  );
}
