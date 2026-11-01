"use client";
import { useId, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useWaveformPeaks } from "../hooks/useWaveformPeaks";
import { formatDuration } from "../utils/composition-plan";

// Only one song plays at a time across every player on the page.
let activeAudio: HTMLAudioElement | null = null;

interface WaveformPlayerProps {
  src: string;
  size?: "card" | "large";
  autoPlay?: boolean;
}

const SEEK_STEP_SEC = 5;

export function WaveformPlayer({ src, size = "card", autoPlay = false }: WaveformPlayerProps) {
  const large = size === "large";
  const bars = large ? 120 : 56;
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const peaks = useWaveformPeaks(src, bars, waveRef);
  // useId() contains ":" which breaks url(#…) references, so keep only safe characters.
  const gradientId = `wf${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const progress = duration ? time / duration : 0;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => undefined);
    else audio.pause();
  };

  const fractionAt = (clientX: number) => {
    const rect = waveRef.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };
  const seekTo = (fraction: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = fraction * duration;
    setTime(audio.currentTime);
  };
  const seekBy = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = Math.min(duration, Math.max(0, audio.currentTime + seconds));
    setTime(audio.currentTime);
  };

  return (
    <div
      // The card opens a preview on click; clicks on the player must not reach it.
      onClick={(e) => e.stopPropagation()}
      className={`relative z-10 flex w-full flex-col ${large ? "gap-5" : "h-full justify-end gap-3 p-4"}`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        autoPlay={autoPlay}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => !dragging && setTime(e.currentTarget.currentTime)}
        onPlay={(e) => {
          if (activeAudio && activeAudio !== e.currentTarget) activeAudio.pause();
          activeAudio = e.currentTarget;
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <div
        ref={waveRef}
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(time)}
        aria-valuetext={`${formatDuration(time)} of ${formatDuration(duration)}`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          seekTo(fractionAt(e.clientX));
        }}
        onPointerMove={(e) => {
          const f = fractionAt(e.clientX);
          setHover(f);
          if (dragging) seekTo(f);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => !dragging && setHover(null)}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggle();
          } else if (e.key === "ArrowRight") seekBy(SEEK_STEP_SEC);
          else if (e.key === "ArrowLeft") seekBy(-SEEK_STEP_SEC);
        }}
        className={`w-full cursor-pointer touch-none rounded-md focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none ${
          large ? "h-40" : "min-h-0 flex-1"
        }`}
      >
        <svg
          viewBox={`0 0 ${bars * 3} 100`}
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-secondary)" />
            </linearGradient>
          </defs>
          {peaks.map((peak, i) => {
            const at = (i + 0.5) / bars;
            const h = Math.max(4, peak * 96);
            const fill =
              at <= progress
                ? `url(#${gradientId})`
                : hover !== null && at <= hover
                  ? "rgba(255,255,255,0.45)"
                  : "rgba(255,255,255,0.22)";
            return <rect key={i} x={i * 3 + 0.5} y={(100 - h) / 2} width={2} height={h} rx={1} fill={fill} />;
          })}
        </svg>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className={`flex shrink-0 items-center justify-center rounded-full text-white shadow-[0_0_18px_-4px_var(--color-primary)] transition-transform active:scale-95 ${
            large ? "size-14" : "size-10"
          }`}
          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
        >
          {playing ? (
            <Pause className={large ? "size-6" : "size-4"} fill="currentColor" />
          ) : (
            <Play className={`${large ? "size-6" : "size-4"} translate-x-px`} fill="currentColor" />
          )}
        </button>
        <span className={`tabular-nums text-white/60 ${large ? "ml-auto text-sm" : "text-xs"}`}>
          {formatDuration(time)} / {formatDuration(duration)}
        </span>
      </div>
    </div>
  );
}
