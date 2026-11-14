"use client";

import {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadTrim } from "@/features/media/api/upload";

/** Same limits the backend enforces for upload trims. */
export const TRIM_MIN_SECONDS = 3;
export const TRIM_MAX_SECONDS = 120;
const THUMBS = 10;

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/** 75.25 -> "1:15.2" */
export function formatTime(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const rest = s - m * 60;
  return `${m}:${rest < 10 ? "0" : ""}${rest.toFixed(1)}`;
}

/** Frames along the video for the timeline background. Fails quietly (it's decoration). */
async function captureThumbnails(src: string, duration: number, count: number): Promise<string[]> {
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "auto";
  video.src = src;
  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error("no preview"));
  });
  const canvas = document.createElement("canvas");
  const h = 64;
  canvas.height = h;
  canvas.width = Math.max(1, Math.round((video.videoWidth / Math.max(1, video.videoHeight)) * h));
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  const frames: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = Math.min(duration - 0.05, (duration * (i + 0.5)) / count);
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      video.currentTime = Math.max(0, t);
    });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    frames.push(canvas.toDataURL("image/jpeg", 0.6));
  }
  video.removeAttribute("src");
  video.load();
  return frames;
}

interface VideoTrimEditorProps {
  src: string;
  /** The part to keep, or null when the whole video is kept. */
  onChange: (trim: UploadTrim | null) => void;
  onError: () => void;
}

type DragMode = "start" | "end" | "move";

/** Drag the handles to choose which part of the video to upload. */
export function VideoTrimEditor({ src, onChange, onError }: VideoTrimEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ mode: DragMode; grabAt: number; start: number; end: number } | null>(null);
  const [duration, setDuration] = useState(0);
  const [range, setRange] = useState({ start: 0, end: 0 });
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]);

  // Tell the parent what to upload whenever the range changes.
  useEffect(() => {
    if (!duration) return;
    const whole = range.start <= 0.05 && range.end >= duration - 0.05;
    onChange(whole ? null : { start: +range.start.toFixed(3), end: +range.end.toFixed(3) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, duration]);

  useEffect(() => {
    if (!duration) return;
    let cancelled = false;
    captureThumbnails(src, duration, THUMBS)
      .then((frames) => !cancelled && setThumbs(frames))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [src, duration]);

  const onLoaded = () => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration) || v.duration <= 0) return onError();
    setDuration(v.duration);
    setRange({ start: 0, end: Math.min(v.duration, TRIM_MAX_SECONDS) });
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    // Play only the kept part, on a loop.
    if (v.currentTime >= range.end - 0.02 || v.currentTime < range.start - 0.25) {
      v.currentTime = range.start;
    }
    setCurrent(v.currentTime);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      if (v.currentTime < range.start || v.currentTime >= range.end - 0.05) v.currentTime = range.start;
      void v.play();
    } else {
      v.pause();
    }
  };

  const seek = (t: number) => {
    const v = videoRef.current;
    if (v) v.currentTime = clamp(t, 0, duration);
    setCurrent(clamp(t, 0, duration));
  };

  const secondsAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || !rect.width) return 0;
    return clamp(((clientX - rect.left) / rect.width) * duration, 0, duration);
  };

  const applyRange = (mode: DragMode, start: number, end: number) => {
    let s = start;
    let e = end;
    if (mode === "start") {
      s = clamp(s, Math.max(0, e - TRIM_MAX_SECONDS), e - TRIM_MIN_SECONDS);
    } else if (mode === "end") {
      e = clamp(e, s + TRIM_MIN_SECONDS, Math.min(duration, s + TRIM_MAX_SECONDS));
    } else {
      const length = e - s;
      s = clamp(s, 0, duration - length);
      e = s + length;
    }
    setRange({ start: s, end: e });
    seek(mode === "end" ? Math.max(s, e - 0.1) : s);
  };

  const onPointerDown = (mode: DragMode) => (e: ReactPointerEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    videoRef.current?.pause();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { mode, grabAt: secondsAt(e.clientX), start: range.start, end: range.end };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    const delta = secondsAt(e.clientX) - d.grabAt;
    if (d.mode === "start") applyRange("start", d.start + delta, d.end);
    else if (d.mode === "end") applyRange("end", d.start, d.end + delta);
    else applyRange("move", d.start + delta, d.end + delta);
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const onHandleKey = (mode: "start" | "end") => (e: ReactKeyboardEvent<HTMLElement>) => {
    const step = e.shiftKey ? 1 : 0.1;
    const dir = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
    if (!dir) return;
    e.preventDefault();
    if (mode === "start") applyRange("start", range.start + dir * step, range.end);
    else applyRange("end", range.start, range.end + dir * step);
  };

  const pct = (t: number) => (duration ? (t / duration) * 100 : 0);
  const length = range.end - range.start;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full h-[min(46vh,400px)] rounded-xl overflow-hidden bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src={src}
          className="max-w-full max-h-full"
          playsInline
          preload="auto"
          onLoadedMetadata={onLoaded}
          onTimeUpdate={onTimeUpdate}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={onError}
          onClick={togglePlay}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!duration}
          aria-label={playing ? "Pause" : "Play"}
          className="w-9 h-9 shrink-0 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-40"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-[1px]" />}
        </button>

        {/* Timeline */}
        <div
          ref={trackRef}
          className="relative flex-1 h-14 rounded-lg overflow-hidden bg-white/[0.06] select-none touch-none"
          onPointerDown={(e) => duration && seek(secondsAt(e.clientX))}
        >
          {thumbs.length > 0 && (
            <div className="absolute inset-0 flex pointer-events-none">
              {thumbs.map((t, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={t} alt="" className="h-full flex-1 min-w-0 object-cover" />
              ))}
            </div>
          )}
          {duration > 0 && (
            <>
              {/* Dimmed parts that are cut */}
              <div className="absolute inset-y-0 left-0 bg-black/65 pointer-events-none" style={{ width: `${pct(range.start)}%` }} />
              <div className="absolute inset-y-0 right-0 bg-black/65 pointer-events-none" style={{ width: `${100 - pct(range.end)}%` }} />

              {/* Kept part: drag to move */}
              <div
                className="absolute inset-y-0 border-y-2 border-white cursor-grab active:cursor-grabbing"
                style={{ left: `${pct(range.start)}%`, width: `${pct(range.end) - pct(range.start)}%` }}
                onPointerDown={onPointerDown("move")}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              />

              {(["start", "end"] as const).map((mode) => (
                <div
                  key={mode}
                  role="slider"
                  tabIndex={0}
                  aria-label={mode === "start" ? "Start of the part to keep" : "End of the part to keep"}
                  aria-valuemin={0}
                  aria-valuemax={Math.round(duration * 10) / 10}
                  aria-valuenow={Math.round((mode === "start" ? range.start : range.end) * 10) / 10}
                  aria-valuetext={formatTime(mode === "start" ? range.start : range.end)}
                  className={cn(
                    "absolute inset-y-0 w-3 bg-white cursor-ew-resize flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9370ff]",
                    mode === "start" ? "rounded-l-md" : "rounded-r-md",
                  )}
                  // Inside the kept part, so they stay visible at the very start / end.
                  style={
                    mode === "start"
                      ? { left: `${pct(range.start)}%` }
                      : { left: `calc(${pct(range.end)}% - 12px)` }
                  }
                  onPointerDown={onPointerDown(mode)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  onKeyDown={onHandleKey(mode)}
                >
                  <span className="w-[2px] h-5 rounded-full bg-black/50" />
                </div>
              ))}

              {/* Playhead */}
              <div
                className="absolute inset-y-0 w-[2px] bg-[#9370ff] pointer-events-none"
                style={{ left: `${pct(current)}%` }}
              />
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[12px] tabular-nums">
        <span className="text-[#8a8a8a]">
          {duration ? `${formatTime(range.start)} – ${formatTime(range.end)}` : "Loading video…"}
        </span>
        <span className="text-white font-medium">
          {duration ? `${length.toFixed(1)}s of ${duration.toFixed(1)}s` : ""}
        </span>
      </div>
    </div>
  );
}
