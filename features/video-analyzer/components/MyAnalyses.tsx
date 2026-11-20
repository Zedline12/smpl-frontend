"use client";

import { useState } from "react";
import Link from "next/link";
import { ScanLine } from "lucide-react";
import {
  EmptyState,
  LibraryPage,
  primaryButton,
} from "@/features/ads-studio/components/library/LibraryPage";
import { cn } from "@/lib/utils";
import { useMyVideoAnalyses } from "../hooks/use-video-analyzer";
import { ANALYSIS_TYPES, VideoAnalysisType } from "../types";
import {
  VideoAnalysisCard,
  VideoAnalysisCardSkeleton,
} from "./VideoAnalysisCard";

type Filter = "all" | VideoAnalysisType;
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  ...ANALYSIS_TYPES.map((t) => ({ value: t.value, label: t.label })),
];

/** Video Analyzer → My analyses: everything the user analyzed, by type. */
export function MyAnalyses() {
  const [filter, setFilter] = useState<Filter>("all");
  const { analyses, isLoading, isError, error, refetch } = useMyVideoAnalyses();
  const shown = (analyses ?? []).filter(
    (a) => filter === "all" || (a.type ?? "remake") === filter,
  );
  const newButton = (
    <Link href="/video-analyzer" className={primaryButton}>
      <ScanLine className="size-4" />
      New analysis
    </Link>
  );

  return (
    <LibraryPage
      title="My analyses"
      description="Your remake prompts and scripts, newest first."
      action={newButton}
    >
      <div className="flex flex-wrap gap-1.5" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              filter === f.value
                ? "border-white bg-white text-black"
                : "border-white/10 text-white/70 hover:text-white",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <VideoAnalysisCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<ScanLine className="size-6" />}
          title="Couldn't load your analyses"
          text={error instanceof Error ? error.message : "Please try again."}
          action={
            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm font-medium text-white/70 hover:text-white"
            >
              Try again
            </button>
          }
        />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={<ScanLine className="size-6" />}
          title={
            filter === "all" ? "No analyses yet" : "Nothing of this type yet"
          }
          text="Add a video on Home to get remake prompts or its script."
          action={newButton}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {shown.map((a) => (
            <VideoAnalysisCard key={a.id} analysis={a} />
          ))}
        </div>
      )}
    </LibraryPage>
  );
}
