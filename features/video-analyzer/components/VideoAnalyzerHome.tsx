"use client";

import { Suspense, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ScanLine } from "lucide-react";
import { useCreateVideoAnalysisMutation } from "../hooks/use-video-analyzer";
import { AnalyzerHeroBackground } from "./AnalyzerHeroBackground";
import { CreateVideoAnalysisForm } from "./CreateVideoAnalysisForm";
import { VideoAnalysesGrid } from "./VideoAnalysesGrid";
import { VideoAnalysisModal } from "./VideoAnalysisModal";

/** The open analysis lives in `?analysis=<id>`, so the modal survives a refresh and can be linked to. */
const ANALYSIS_PARAM = "analysis";

function useAnalysisParam() {
  const router = useRouter();
  const pathname = usePathname();

  const setAnalysisId = useCallback(
    (id: string | null) => {
      const url = id ? `${pathname}?${ANALYSIS_PARAM}=${encodeURIComponent(id)}` : pathname;
      router.replace(url, { scroll: false });
    },
    [router, pathname],
  );

  return setAnalysisId;
}

/** Reads the URL; kept separate so only it needs a Suspense boundary. */
function AnalysisModalFromUrl({ onClose }: { onClose: () => void }) {
  const analysisId = useSearchParams().get(ANALYSIS_PARAM);
  return <VideoAnalysisModal analysisId={analysisId} onClose={onClose} />;
}

/** Video Analyzer: a hero with the upload form on top, the user's analyses below. */
export function VideoAnalyzerHome() {
  const createAnalysis = useCreateVideoAnalysisMutation();
  const analysesRef = useRef<HTMLElement>(null);
  const setAnalysisId = useAnalysisParam();

  return (
    <div className="relative min-h-full">
      {/* Violet page light */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-56 left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-violet-600 opacity-25 blur-[140px]" />
        <div className="absolute top-1/3 -right-48 size-[30rem] rounded-full bg-fuchsia-500 opacity-[0.12] blur-[140px]" />
        <div className="absolute bottom-0 -left-48 size-[32rem] rounded-full bg-indigo-600 opacity-[0.14] blur-[140px]" />
      </div>

      <div className="relative mx-auto flex w-[90%] max-w-[1600px] flex-col gap-10 pt-3 pb-12">
        {/* Hero: create section */}
        <section className="relative flex min-h-[58vh] items-center justify-center overflow-hidden rounded-3xl border border-violet-400/15 bg-[#07030f] shadow-[0_0_80px_-30px_rgba(168,85,247,0.8)]">
          <AnalyzerHeroBackground />
          {/* Darken the scene, most of all behind the form */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 50% 62% at 50% 50%, rgba(7,3,15,0.94), rgba(7,3,15,0.7) 60%, rgba(7,3,15,0.45))",
            }}
          />

          <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-3 px-4 py-12 sm:py-16">
            <span className="rounded-md border border-fuchsia-300/30 bg-fuchsia-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.25em] text-fuchsia-200 uppercase">
              Scene · Shot · Prompt
            </span>
            <h1
              className="text-center text-4xl font-black tracking-tight text-white uppercase sm:text-6xl"
              style={{
                fontFamily: "var(--font-display)",
                textShadow: "0 0 24px rgba(168,85,247,0.85), 0 0 60px rgba(217,70,239,0.45)",
              }}
            >
              Video Analyzer
            </h1>
            <p className="mb-3 text-center text-sm text-violet-100/70">
              Drop in any video. Get every scene broken down, with a prompt to recreate it.
            </p>
            <CreateVideoAnalysisForm
              className="w-full border-white/10 bg-[#0b0614]/60 shadow-[0_0_60px_-15px_rgba(168,85,247,0.8)] backdrop-blur-xl"
              isSubmitting={createAnalysis.isPending}
              onSubmit={(values) =>
                createAnalysis.mutate(values, {
                  onSuccess: () => {
                    toast.success("Analysis started");
                    analysesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  },
                })
              }
            />
          </div>
        </section>

        {/* The user's analyses */}
        <section
          ref={analysesRef}
          className="relative flex scroll-mt-4 flex-col gap-5 overflow-hidden rounded-3xl border border-violet-400/15 bg-[#0b0614]/50 p-4 shadow-[0_0_80px_-40px_rgba(168,85,247,0.8)] backdrop-blur-xl sm:p-6"
        >
          {/* Timecode ruler along the top edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-2.5 opacity-50"
            style={{
              background:
                "repeating-linear-gradient(90deg, rgba(216,180,254,0.7) 0 1px, transparent 1px 12px), repeating-linear-gradient(90deg, rgba(232,121,249,0.9) 0 1px, transparent 1px 60px)",
              backgroundSize: "auto 50%, auto 100%",
              backgroundRepeat: "repeat-x",
            }}
          />
          <div className="flex items-end justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-violet-300/30 bg-violet-500/15 shadow-[0_0_24px_-6px_rgba(168,85,247,0.9)]">
                <ScanLine className="size-5 text-violet-200" />
              </span>
              <div>
                <h2
                  className="text-2xl font-black tracking-tight text-white uppercase"
                  style={{
                    fontFamily: "var(--font-display)",
                    textShadow: "0 0 18px rgba(168,85,247,0.7)",
                  }}
                >
                  Your analyses
                </h2>
                <p className="text-sm text-violet-100/55">
                  Click any video to see its scene breakdown and prompts.
                </p>
              </div>
            </div>
          </div>
          <VideoAnalysesGrid onOpen={setAnalysisId} />
        </section>
      </div>

      <Suspense fallback={null}>
        <AnalysisModalFromUrl onClose={() => setAnalysisId(null)} />
      </Suspense>
    </div>
  );
}
