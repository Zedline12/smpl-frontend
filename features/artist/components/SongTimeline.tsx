"use client";
import {
  MusicLimits,
  MusicSection,
} from "@/features/generation/types/models/elevenlabs-music-v2-5.type";
import { formatDuration, sectionName, totalSeconds } from "../utils/composition-plan";

/** One bar showing each section's share of the song and the 10-minute cap. */
export function SongTimeline({ sections }: { sections: MusicSection[] }) {
  const total = totalSeconds(sections);
  const over = total > MusicLimits.maxTotalSec;
  const scale = Math.max(total, 1);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-white/[0.06]">
        {sections.map((s, i) => (
          <div
            key={s.id}
            title={`${sectionName(s)} · ${formatDuration(s.durationSec)}`}
            style={{ width: `${(s.durationSec / scale) * 100}%` }}
            className={`h-full ${over ? "bg-red-500/70" : i % 2 ? "bg-primary/55" : "bg-primary"}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[11px]">
        <span className={over ? "font-medium text-red-400" : "text-white/60"}>
          {formatDuration(total)} total · {sections.length}/{MusicLimits.maxChunks} sections
        </span>
        <span className="text-white/35">max {formatDuration(MusicLimits.maxTotalSec)}</span>
      </div>
    </div>
  );
}
