"use client";

import { ListVideo, MessageSquare, Type } from "lucide-react";
import { VideoAnalysisScene } from "../types";

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

  return (
    <div className="relative flex flex-col gap-4 pl-6">
      <div className="bg-border absolute top-1 bottom-1 left-[7px] w-px" />
      {scenes.map((scene, index) => (
        <div key={index} className="relative">
          <div className="bg-primary border-background absolute top-1.5 -left-6 size-3.5 rounded-full border-2" />
          <div className="border-border bg-card rounded-2xl border p-4">
            <span className="bg-muted text-foreground inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold">
              {scene.timestamp}
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
          </div>
        </div>
      ))}
    </div>
  );
}
