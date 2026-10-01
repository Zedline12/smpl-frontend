"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, ListVideo, MessageSquare, Type } from "lucide-react";
import { VideoAnalysisScene } from "../types";
import { formatDuration } from "../utils";

function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!navigator.clipboard?.writeText) {
      toast.info(prompt);
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success("Prompt copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the prompt");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="text-muted-foreground hover:text-foreground flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors"
    >
      {copied ? (
        <Check className="size-3.5 text-green-500" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function SceneList({ scenes }: { scenes: VideoAnalysisScene[] }) {
  if (!scenes.length) {
    return (
      <div className="border-border bg-card rounded-2xl border border-dashed py-16 text-center">
        <div className="bg-muted text-muted-foreground mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
          <ListVideo className="size-8" />
        </div>
        <h3 className="text-foreground text-lg font-semibold">No scenes found</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          This analysis finished without producing any scenes.
        </p>
      </div>
    );
  }

  const sorted = [...scenes].sort((a, b) => a.index - b.index);

  return (
    <div className="relative flex flex-col gap-4 pl-6">
      <div className="bg-border absolute top-1 bottom-1 left-[7px] w-px" />
      {sorted.map((scene) => (
        <div key={scene.id} className="relative">
          <div className="bg-primary border-background absolute top-1.5 -left-6 size-3.5 rounded-full border-2" />
          <div className="border-border bg-card rounded-2xl border p-4">
            <span className="bg-muted text-foreground inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold">
              {formatDuration(scene.startTime)} – {formatDuration(scene.endTime)}
            </span>

            <p className="text-foreground mt-3 text-sm leading-relaxed">
              {scene.visual}
            </p>

            {scene.dialogue && (
              <p className="text-muted-foreground mt-2 flex items-start gap-1.5 text-sm leading-relaxed italic">
                <MessageSquare className="mt-0.5 size-3.5 shrink-0" />
                &ldquo;{scene.dialogue}&rdquo;
              </p>
            )}

            {scene.onScreenText && (
              <p className="text-muted-foreground mt-2 flex items-start gap-1.5 text-xs leading-relaxed">
                <Type className="mt-0.5 size-3.5 shrink-0" />
                {scene.onScreenText}
              </p>
            )}

            {scene.prompt && (
              <div className="border-border bg-background-light mt-3 rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                    Prompt
                  </span>
                  <CopyPromptButton prompt={scene.prompt} />
                </div>
                <p className="text-foreground/85 mt-1.5 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {scene.prompt}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
