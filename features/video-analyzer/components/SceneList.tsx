"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, ListVideo, MessageSquare, Play, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoAnalysisScene } from "../types";
import { formatDuration } from "../utils";

export async function copyText(text: string, successMessage: string) {
  if (!navigator.clipboard?.writeText) {
    toast.info(text);
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
    return true;
  } catch {
    toast.error("Could not copy to the clipboard");
    return false;
  }
}

function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (await copyText(prompt, "Prompt copied")) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-[11px] font-medium text-violet-100/70 transition-colors hover:border-fuchsia-300/40 hover:text-white"
    >
      {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

interface SceneListProps {
  scenes: VideoAnalysisScene[];
  /** Id of the scene under the video's playhead, if any. */
  activeSceneId?: string | null;
  /** Jump the video to a scene's start. */
  onSeek?: (seconds: number) => void;
}

/** Sort scenes by their position in the video. */
export function sortScenes(scenes: VideoAnalysisScene[]) {
  return [...scenes].sort((a, b) => a.index - b.index);
}

export function SceneList({ scenes, activeSceneId, onSeek }: SceneListProps) {
  if (!scenes.length) {
    return (
      <div className="rounded-2xl border border-dashed border-violet-400/25 py-14 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-violet-300/30 bg-violet-500/15 text-violet-200">
          <ListVideo className="size-7" />
        </div>
        <h3 className="text-base font-semibold text-white">No scenes found</h3>
        <p className="mt-1 text-sm text-violet-100/50">
          This analysis finished without producing any scenes.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative flex flex-col gap-3 pl-6">
      <span aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-violet-500/60 via-fuchsia-500/40 to-transparent" />
      {sortScenes(scenes).map((scene, i) => {
        const active = scene.id === activeSceneId;
        return (
          <li key={scene.id} className="relative">
            <span
              aria-hidden
              className={cn(
                "absolute top-4 -left-6 size-3.5 rounded-full border-2 border-[#0b0614] transition-all",
                active
                  ? "scale-125 bg-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,0.9)]"
                  : "bg-violet-500",
              )}
            />
            <div
              className={cn(
                "rounded-xl border p-4 transition-colors",
                active
                  ? "border-fuchsia-400/50 bg-fuchsia-500/[0.07] shadow-[0_0_30px_-14px_rgba(217,70,239,0.9)]"
                  : "border-white/10 bg-white/[0.02]",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-fuchsia-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  disabled={!onSeek}
                  onClick={() => onSeek?.(scene.startTime)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-violet-300/25 bg-violet-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-violet-100 transition-colors hover:border-fuchsia-300/50 hover:text-white disabled:cursor-default"
                  title="Play from here"
                >
                  {onSeek && <Play className="size-2.5 fill-current" />}
                  {formatDuration(scene.startTime)} – {formatDuration(scene.endTime)}
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-white/90">{scene.visual}</p>

              {scene.dialogue && (
                <p className="mt-2 flex items-start gap-1.5 text-sm leading-relaxed text-violet-100/60 italic">
                  <MessageSquare className="mt-0.5 size-3.5 shrink-0" />
                  &ldquo;{scene.dialogue}&rdquo;
                </p>
              )}

              {scene.onScreenText && (
                <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-violet-100/60">
                  <Type className="mt-0.5 size-3.5 shrink-0" />
                  {scene.onScreenText}
                </p>
              )}

              {scene.prompt && (
                <div className="mt-3 rounded-lg border border-violet-400/15 bg-black/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-semibold tracking-widest text-fuchsia-300/80 uppercase">
                      Prompt
                    </span>
                    <CopyPromptButton prompt={scene.prompt} />
                  </div>
                  <p className="mt-1.5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-white/80">
                    {scene.prompt}
                  </p>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
