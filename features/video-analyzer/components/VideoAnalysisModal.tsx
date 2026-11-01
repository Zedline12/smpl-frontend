"use client";

import { ReactNode, useMemo, useRef, useState } from "react";
import { AlertTriangle, Clock, Coins, Copy, ListVideo, Loader2, ScanLine, Timer } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useVideoAnalysisQuery } from "../hooks/use-video-analyzer";
import { VideoAnalysisProject, isActiveStatus } from "../types";
import { formatDuration } from "../utils";
import { SceneList, copyText, sortScenes } from "./SceneList";

interface VideoAnalysisModalProps {
  /** The analysis to show; `null` closes the modal. */
  analysisId: string | null;
  onClose: () => void;
}

function Stat({ icon: Icon, children }: { icon: typeof Clock; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-300/20 bg-violet-500/10 px-2 py-1 font-mono text-[11px] text-violet-100/80">
      <Icon className="size-3 text-fuchsia-300" />
      {children}
    </span>
  );
}

function ModalSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 p-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="aspect-video rounded-xl bg-violet-500/10" />
        <div className="h-6 w-2/3 rounded bg-white/10" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 w-20 rounded-md bg-white/5" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

function AnalysisDetails({ analysis }: { analysis: VideoAnalysisProject }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const title = analysis.name?.trim() || "Untitled analysis";
  const active = isActiveStatus(analysis.status);
  const failed = analysis.status === "failure";
  const scenes = useMemo(() => sortScenes(analysis.scenes ?? []), [analysis.scenes]);

  const activeSceneId =
    scenes.find((s) => currentTime >= s.startTime && currentTime < s.endTime)?.id ?? null;

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = seconds;
    void video.play().catch(() => {});
  };

  const copyAllPrompts = () => {
    const text = scenes
      .filter((s) => s.prompt)
      .map(
        (s, i) =>
          `Scene ${i + 1} (${formatDuration(s.startTime)}–${formatDuration(s.endTime)})\n${s.prompt}`,
      )
      .join("\n\n");
    void copyText(text, "All prompts copied");
  };

  return (
    <div className="grid min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Left: the video and its facts */}
      <div className="flex flex-col gap-4 border-b border-white/5 p-5 sm:p-6 lg:border-r lg:border-b-0">
        <div className="relative overflow-hidden rounded-xl border border-violet-400/20 bg-black shadow-[0_0_50px_-20px_rgba(168,85,247,0.9)]">
          <video
            ref={videoRef}
            src={analysis.originalVideoUrl}
            controls
            playsInline
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            className="max-h-[42vh] w-full object-contain"
          />
        </div>

        {/* Scene map: one segment per scene, click to jump */}
        {scenes.length > 0 && analysis.durationSeconds ? (
          <div className="flex h-3 gap-[2px]">
            {scenes.map((scene, i) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => seek(scene.startTime)}
                title={`Scene ${i + 1} · ${formatDuration(scene.startTime)}`}
                className={cn(
                  "h-full cursor-pointer rounded-[3px] transition-all hover:brightness-125",
                  scene.id === activeSceneId
                    ? "bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.9)]"
                    : "bg-gradient-to-r from-violet-600/80 to-fuchsia-500/60",
                )}
                style={{ flexGrow: Math.max(scene.endTime - scene.startTime, 0.5) }}
              />
            ))}
          </div>
        ) : null}

        <div>
          <DialogTitle
            className="text-xl font-black tracking-tight text-white uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-violet-100/50">
            Scene-by-scene breakdown with a prompt to recreate each shot.
          </DialogDescription>
        </div>

        <div className="flex flex-wrap gap-2">
          <Stat icon={ListVideo}>{analysis.totalScenes ?? 0} scenes</Stat>
          <Stat icon={Clock}>{formatDuration(analysis.durationSeconds)}</Stat>
          <Stat icon={Timer}>{analysis.sceneDurationSeconds}s each</Stat>
          <Stat icon={Coins}>{analysis.creditsUsed} credits</Stat>
        </div>
      </div>

      {/* Right: the scenes */}
      <div className="custom-scrollbar flex min-h-0 flex-col gap-4 p-5 sm:p-6 lg:max-h-[86vh] lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 pr-10 lg:pr-8">
          <h3 className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-widest text-fuchsia-300 uppercase">
            <ScanLine className="size-3.5" />
            Scene breakdown
          </h3>
          {!active && !failed && scenes.some((s) => s.prompt) && (
            <button
              type="button"
              onClick={copyAllPrompts}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-fuchsia-300/30 bg-fuchsia-500/10 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-100 transition-colors hover:bg-fuchsia-500/20"
            >
              <Copy className="size-3.5" />
              Copy all prompts
            </button>
          )}
        </div>

        {active && (
          <div className="flex items-center gap-3 rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/[0.06] p-4">
            {analysis.status === "pending" ? (
              <Clock className="size-5 shrink-0 text-violet-200" />
            ) : (
              <Loader2 className="size-5 shrink-0 animate-spin text-fuchsia-300" />
            )}
            <div>
              <p className="text-sm font-medium text-white">
                {analysis.status === "pending" ? "Waiting to start" : "Analyzing the video…"}
              </p>
              <p className="mt-0.5 text-xs text-violet-100/50">
                This updates on its own. You can close this and come back.
              </p>
            </div>
          </div>
        )}

        {failed && (
          <div className="flex items-start gap-2 rounded-xl bg-red-500/10 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
            <p className="text-sm leading-snug text-red-300">
              {analysis.errorMessage || "This video could not be analyzed."}
            </p>
          </div>
        )}

        {!active && !failed && (
          <SceneList scenes={scenes} activeSceneId={activeSceneId} onSeek={seek} />
        )}
      </div>
    </div>
  );
}

/** Full details of one analysis, over the studio page. */
export function VideoAnalysisModal({ analysisId, onClose }: VideoAnalysisModalProps) {
  // Keep showing the last analysis while the modal animates closed.
  const [shownId, setShownId] = useState(analysisId);
  if (analysisId && analysisId !== shownId) setShownId(analysisId);

  const { data: analysis, isLoading, isError, error } = useVideoAnalysisQuery(shownId ?? "");

  return (
    <Dialog open={!!analysisId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="block max-h-[92vh] w-[94vw] max-w-6xl gap-0 overflow-y-auto rounded-2xl border border-violet-400/20 bg-[#0b0614]/95 p-0 shadow-[0_0_120px_-30px_rgba(168,85,247,0.9)] backdrop-blur-2xl sm:rounded-2xl lg:overflow-hidden">
        {/* Gradient rule along the top edge */}
        <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-fuchsia-400/70 to-transparent" />

        {isLoading ? (
          <>
            <DialogTitle className="sr-only">Loading analysis</DialogTitle>
            <ModalSkeleton />
          </>
        ) : isError || !analysis ? (
          <div className="p-8">
            <DialogTitle className="text-lg text-white">Analysis not found</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-violet-100/60">
              {error instanceof Error ? error.message : "This video analysis could not be found."}
            </DialogDescription>
          </div>
        ) : (
          <AnalysisDetails key={analysis.id} analysis={analysis} />
        )}
      </DialogContent>
    </Dialog>
  );
}
