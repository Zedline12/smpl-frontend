"use client";

import { ReactNode, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronLeft,
  Copy,
  Download,
  FileText,
  ScanLine,
  Trash2,
  Wand2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  EmptyState,
  ghostButton,
} from "@/features/ads-studio/components/library/LibraryPage";
import { JobProgress } from "@/features/live/JobProgress";
import { useLiveItem } from "@/features/live/store";
import { cn } from "@/lib/utils";
import {
  useDeleteVideoAnalysisMutation,
  useVideoAnalysisQuery,
} from "../hooks/use-video-analyzer";
import {
  VideoAnalysisProject,
  analysisTypeLabel,
  isActiveStatus,
} from "../types";
import { formatDuration } from "../utils";
import {
  CopyButton,
  SceneList,
  copyText,
  sortScenes,
  timeRange,
} from "./SceneList";
import { ScriptView, scriptToText } from "./ScriptView";
import { resultCount } from "./VideoAnalysisCard";

const smallButton =
  "flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:border-white/25 hover:text-white";

function Stat({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs text-white/70 tabular-nums">
      {children}
    </span>
  );
}

function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/[\\/:*?"<>|]+/g, " ").trim() || "script"}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function Results({ analysis }: { analysis: VideoAnalysisProject }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const live = useLiveItem("video-analysis", analysis.id);
  const isScript = analysis.type === "script";
  const active = isActiveStatus(analysis.status);
  const failed = analysis.status === "failure";
  const scenes = useMemo(
    () => sortScenes(analysis.scenes ?? []),
    [analysis.scenes],
  );
  const activeId =
    scenes.find((s) => currentTime >= s.startTime && currentTime < s.endTime)
      ?.id ?? null;

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = seconds;
    void video.play().catch(() => {});
  };

  const allPrompts = scenes
    .filter((s) => s.prompt)
    .map((s, i) => `Scene ${i + 1} (${timeRange(s)})\n${s.prompt}`)
    .join("\n\n");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* The video, stuck in view while the results scroll */}
      <div className="flex flex-col gap-3 lg:sticky lg:top-0 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
          <video
            ref={videoRef}
            src={analysis.originalVideoUrl}
            controls
            playsInline
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            className="max-h-[45vh] w-full object-contain lg:max-h-[55vh]"
          />
        </div>

        {/* One segment per scene or section: click to jump */}
        {scenes.length > 0 && (
          <div className="flex h-2 gap-[2px]">
            {scenes.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => seek(s.startTime)}
                title={`${s.title || (isScript ? `Section ${i + 1}` : `Scene ${i + 1}`)} · ${formatDuration(s.startTime)}`}
                aria-label={`Jump to ${formatDuration(s.startTime)}`}
                className={cn(
                  "h-full rounded-full transition-colors",
                  s.id === activeId
                    ? "bg-primary"
                    : "bg-white/15 hover:bg-white/30",
                )}
                style={{ flexGrow: Math.max(s.endTime - s.startTime, 0.5) }}
              />
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Stat>{analysisTypeLabel(analysis.type)}</Stat>
          <Stat>{formatDuration(analysis.durationSeconds)}</Stat>
          {!active && !failed && <Stat>{resultCount(analysis)}</Stat>}
          {!isScript && analysis.sceneDurationSeconds && (
            <Stat>{analysis.sceneDurationSeconds}s scenes</Stat>
          )}
          <Stat>{analysis.creditsUsed} credits</Stat>
        </div>
      </div>

      {/* The results */}
      <div className="flex min-w-0 flex-col gap-4">
        {active && (
          <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="text-sm font-medium text-white">
              {analysis.status === "pending"
                ? "Waiting to start"
                : isScript
                  ? "Writing out the script…"
                  : "Making remake prompts…"}
            </p>
            <JobProgress
              job={{
                status: live?.status ?? analysis.status,
                // Without the live stream, a running analysis started when it last changed.
                startedAt:
                  live?.startedAt ??
                  (analysis.status === "processing"
                    ? analysis.updatedAt
                    : null),
                estimatedSeconds: live?.estimatedSeconds,
              }}
            />
            <p className="text-xs text-white/45">
              This updates on its own. You can leave and come back.
            </p>
          </div>
        )}

        {failed && (
          <div className="flex items-start gap-2 rounded-2xl bg-red-500/10 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
            <p className="text-sm leading-snug text-red-300">
              {analysis.errorMessage || "This video could not be analyzed."}
              {analysis.creditsUsed > 0 && " Your credits were refunded."}
            </p>
          </div>
        )}

        {!active && !failed && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-white">
                {isScript ? "Script" : "Scenes and prompts"}
              </h2>
              <div className="flex gap-1.5">
                {isScript ? (
                  <>
                    <CopyButton
                      text={scriptToText(scenes)}
                      label="Copy script"
                      message="Script copied"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        downloadText(analysis.name, scriptToText(scenes))
                      }
                      className={smallButton}
                    >
                      <Download className="size-3.5" />
                      .txt
                    </button>
                  </>
                ) : (
                  allPrompts && (
                    <button
                      type="button"
                      onClick={() =>
                        void copyText(allPrompts, "All prompts copied")
                      }
                      className={smallButton}
                    >
                      <Copy className="size-3.5" />
                      Copy all prompts
                    </button>
                  )
                )}
              </div>
            </div>

            {scenes.length === 0 ? (
              <EmptyState
                icon={<ScanLine className="size-6" />}
                title={isScript ? "No script found" : "No scenes found"}
                text="This analysis finished without any results."
              />
            ) : isScript ? (
              <ScriptView
                sections={scenes}
                activeSectionId={activeId}
                onSeek={seek}
              />
            ) : (
              <SceneList
                scenes={scenes}
                activeSceneId={activeId}
                onSeek={seek}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** One analysis on its own page: the video on the left, the results on the right. */
export function AnalysisView({ id }: { id: string }) {
  const router = useRouter();
  const {
    data: analysis,
    isLoading,
    isError,
    error,
  } = useVideoAnalysisQuery(id);
  const remove = useDeleteVideoAnalysisMutation();
  const [confirming, setConfirming] = useState(false);
  const TypeIcon = analysis?.type === "script" ? FileText : Wand2;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-5 md:p-8">
      <Link
        href="/video-analyzer/analyses"
        className="flex w-fit items-center gap-1 text-sm font-medium text-white/55 hover:text-white"
      >
        <ChevronLeft className="size-4" />
        My analyses
      </Link>

      {isLoading ? (
        <div className="grid animate-pulse gap-6 lg:grid-cols-2">
          <div className="aspect-video rounded-2xl bg-white/[0.05]" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/[0.04]" />
            ))}
          </div>
        </div>
      ) : isError || !analysis ? (
        <EmptyState
          icon={<ScanLine className="size-6" />}
          title="Analysis not found"
          text={
            error instanceof Error
              ? error.message
              : "This analysis could not be found."
          }
        />
      ) : (
        <>
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="bg-primary/20 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                <TypeIcon className="size-5" />
              </span>
              <div className="min-w-0">
                <h1 className="text-xl font-bold break-words text-white sm:text-2xl">
                  {analysis.name?.trim() || "Untitled analysis"}
                </h1>
                <p className="mt-0.5 text-sm text-white/55">
                  {analysis.type === "script"
                    ? "The video's script, section by section."
                    : "Every scene, with a prompt to remake it."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={isActiveStatus(analysis.status)}
              className={ghostButton}
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </header>

          <Results key={analysis.id} analysis={analysis} />

          <AlertDialog open={confirming} onOpenChange={setConfirming}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this analysis?</AlertDialogTitle>
                <AlertDialogDescription>
                  Its results are removed for good. Your video stays in your
                  library.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    remove.mutate(analysis.id, {
                      onSuccess: () => router.push("/video-analyzer/analyses"),
                    })
                  }
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
