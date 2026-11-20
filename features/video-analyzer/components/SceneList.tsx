"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, MessageSquare, Play, Type } from "lucide-react";
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

/** Sort scenes by their position in the video. */
export function sortScenes(scenes: VideoAnalysisScene[]) {
  return [...scenes].sort((a, b) => a.index - b.index);
}

export const timeRange = (s: { startTime: number; endTime: number }) =>
  `${formatDuration(s.startTime)}–${formatDuration(s.endTime)}`;

/** A timestamp chip that jumps the video there. */
export function TimeButton({
  scene,
  onSeek,
  active,
}: {
  scene: VideoAnalysisScene;
  onSeek?: (seconds: number) => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={!onSeek}
      onClick={() => onSeek?.(scene.startTime)}
      title="Play from here"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums transition-colors disabled:cursor-default",
        active
          ? "bg-primary text-white"
          : "bg-white/[0.07] text-white/80 hover:bg-white/[0.12] hover:text-white",
      )}
    >
      {onSeek && <Play className="size-2.5 fill-current" />}
      {timeRange(scene)}
    </button>
  );
}

export function CopyButton({
  text,
  label = "Copy",
  message = "Copied",
}: {
  text: string;
  label?: string;
  message?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (await copyText(text, message)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1 text-xs font-medium text-white/70 transition-colors hover:border-white/25 hover:text-white"
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-400" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}

/** Remake prompts: one card per scene, with the prompt to remake it. */
export function SceneList({
  scenes,
  activeSceneId,
  onSeek,
}: {
  scenes: VideoAnalysisScene[];
  /** The scene under the video's playhead, if any. */
  activeSceneId?: string | null;
  onSeek?: (seconds: number) => void;
}) {
  return (
    <ol className="flex flex-col gap-3">
      {scenes.map((scene, i) => {
        const active = scene.id === activeSceneId;
        return (
          <li
            key={scene.id}
            className={cn(
              "rounded-2xl border p-4 transition-colors",
              active
                ? "border-primary/50 bg-primary/[0.06]"
                : "border-white/[0.08] bg-white/[0.02]",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white/40 tabular-nums">
                Scene {i + 1}
              </span>
              <TimeButton scene={scene} onSeek={onSeek} active={active} />
            </div>

            {scene.visual && (
              <p className="mt-3 text-sm leading-relaxed text-white/85">
                {scene.visual}
              </p>
            )}
            {scene.dialogue && (
              <p className="mt-2 flex items-start gap-1.5 text-sm leading-relaxed text-white/55 italic">
                <MessageSquare className="mt-0.5 size-3.5 shrink-0" />
                &ldquo;{scene.dialogue}&rdquo;
              </p>
            )}
            {scene.onScreenText && (
              <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-white/50">
                <Type className="mt-0.5 size-3.5 shrink-0" />
                {scene.onScreenText}
              </p>
            )}

            {scene.prompt && (
              <div className="mt-3 rounded-xl bg-black/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white/45">
                    Prompt
                  </span>
                  <CopyButton text={scene.prompt} message="Prompt copied" />
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed whitespace-pre-wrap text-white/80">
                  {scene.prompt}
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
