"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, CircleHelp, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMyVideoAnalyses } from "../hooks/use-video-analyzer";
import { AnalyzerComposer } from "./AnalyzerComposer";
import { AnalyzerHero } from "./AnalyzerHero";
import {
  VideoAnalysisCard,
  VideoAnalysisCardSkeleton,
} from "./VideoAnalysisCard";

const STEPS = [
  [
    "Pick what you want",
    "Remake prompts gives a prompt for every scene. Script writes out what's said, section by section.",
  ],
  [
    "Add a video",
    "From your library or a new upload, up to 5 minutes. Add notes if you want it to focus on something.",
  ],
  [
    "Open the result",
    "Jump through the video by timestamp, copy prompts or the whole script. It's kept in My analyses.",
  ],
];

const RECENT = 4;

/** Video Analyzer Home: hero, the composer, then the latest analyses. */
export function VideoAnalyzerHome() {
  const [howOpen, setHowOpen] = useState(false);
  const { analyses, isLoading } = useMyVideoAnalyses();
  const recent = (analyses ?? []).slice(0, RECENT);
  const heroVideo = analyses?.find(
    (a) => a.status === "success",
  )?.originalVideoUrl;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pb-12 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6">
        <AnalyzerHero videoUrl={heroVideo} />
        <AnalyzerComposer />
        <button
          type="button"
          onClick={() => setHowOpen(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white"
        >
          How it works <CircleHelp className="size-4" />
        </button>
      </div>

      {(isLoading || recent.length > 0) && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <History className="text-primary size-4" />
              Recent analyses
            </h2>
            <Link
              href="/video-analyzer/analyses"
              className="flex items-center gap-0.5 text-sm font-medium text-white/60 hover:text-white"
            >
              See all <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: RECENT }, (_, i) => (
                  <VideoAnalysisCardSkeleton key={i} />
                ))
              : recent.map((a) => (
                  <VideoAnalysisCard key={a.id} analysis={a} />
                ))}
          </div>
        </section>
      )}

      <Dialog open={howOpen} onOpenChange={setHowOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How Video Analyzer works</DialogTitle>
            <DialogDescription>
              Three steps from any video to prompts or a script.
            </DialogDescription>
          </DialogHeader>
          <ol className="flex flex-col gap-4">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-3">
                <span className="bg-primary/20 text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                  {i + 1}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-white">
                    {title}
                  </span>
                  <span className="text-sm text-white/55">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </div>
  );
}
