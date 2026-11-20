"use client";

import { Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoAnalysisScene } from "../types";
import { TimeButton, timeRange } from "./SceneList";

/** The script as plain text: one block per section, with its timestamps. */
export function scriptToText(sections: VideoAnalysisScene[]): string {
  return sections
    .map((s) => {
      const head = [`[${timeRange(s)}]`, s.title].filter(Boolean).join(" ");
      const lines = [
        head,
        s.dialogue
          ? s.speaker
            ? `${s.speaker}: ${s.dialogue}`
            : s.dialogue
          : "(no speech)",
        s.onScreenText ? `On screen: ${s.onScreenText}` : "",
      ];
      return lines.filter(Boolean).join("\n");
    })
    .join("\n\n");
}

/** Script: the video's words, section by section, like a transcript. */
export function ScriptView({
  sections,
  activeSectionId,
  onSeek,
}: {
  sections: VideoAnalysisScene[];
  activeSectionId?: string | null;
  onSeek?: (seconds: number) => void;
}) {
  return (
    <ol className="flex flex-col">
      {sections.map((s) => {
        const active = s.id === activeSectionId;
        return (
          <li
            key={s.id}
            className={cn(
              "relative border-l-2 py-3 pr-2 pl-4 transition-colors",
              active ? "border-primary" : "border-white/[0.08]",
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <TimeButton scene={s} onSeek={onSeek} active={active} />
              {s.title && (
                <span className="text-xs font-semibold tracking-wide text-white/50 uppercase">
                  {s.title}
                </span>
              )}
            </div>

            {s.speaker && s.dialogue && (
              <p className="mt-2 text-xs font-medium text-white/45">
                {s.speaker}
              </p>
            )}
            {s.dialogue ? (
              <p
                className={cn(
                  "mt-1 text-[15px] leading-relaxed",
                  active ? "text-white" : "text-white/85",
                )}
              >
                {s.dialogue}
              </p>
            ) : (
              <p className="mt-2 text-sm text-white/35 italic">No speech</p>
            )}
            {s.onScreenText && (
              <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-white/45">
                <Type className="mt-0.5 size-3.5 shrink-0" />
                {s.onScreenText}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
