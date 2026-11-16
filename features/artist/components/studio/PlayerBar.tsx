"use client";
import { useEffect, useRef, useState } from "react";
import {
  Heart,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useToggleLikeMutation } from "@/features/media/hooks/useMediaActions";
import { cn } from "@/lib/utils";
import { formatDuration } from "../../utils/composition-plan";
import {
  useArtistPlayerStore,
  useCurrentTrack,
} from "../../stores/useArtistPlayerStore";

/** Seconds into a song after which Previous restarts it instead of going back. */
const RESTART_AFTER_SEC = 3;

/** A thin range bar: grows on hover, primary fill, thumb on hover. */
function Bar({
  value,
  max,
  onChange,
  label,
  className,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={cn("group/bar relative flex h-4 items-center", className)}>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-white transition-colors group-hover/bar:bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className="pointer-events-none absolute size-3 -translate-x-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/bar:opacity-100"
        style={{ left: `${pct}%` }}
      />
      <input
        type="range"
        min={0}
        max={max || 0}
        step="any"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
      />
    </div>
  );
}

const iconButton =
  "flex size-9 items-center justify-center rounded-full text-white/65 transition-colors hover:text-white disabled:opacity-30";

/** The Spotify-style bar at the bottom of the Artist page; plays the queue from the store. */
export function PlayerBar() {
  const track = useCurrentTrack();
  const { playing, shuffle, repeat, volume, muted, queue } =
    useArtistPlayerStore();
  const {
    setPlaying,
    toggle,
    next,
    prev,
    toggleShuffle,
    cycleRepeat,
    setVolume,
    toggleMute,
    setLiked,
  } = useArtistPlayerStore.getState();
  const toggleLike = useToggleLikeMutation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const trackId = track?.id;
  const url = track?.url;

  // One audio element for the whole page; a new song swaps its source.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (url) audio.src = url;
    else audio.removeAttribute("src");
    audio.load();
  }, [trackId, url]);

  // The store decides play/pause (cards and the bar both drive it); the audio follows.
  // An AbortError only means a newer song interrupted this play() call.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !url) return;
    if (playing)
      audio.play().catch((err: unknown) => {
        if ((err as { name?: string })?.name !== "AbortError")
          setPlaying(false);
      });
    else audio.pause();
  }, [playing, trackId, url, setPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Space plays/pauses, unless typing or on a button (which Space already presses).
  useEffect(() => {
    if (!track) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const el = e.target as HTMLElement | null;
      if (
        el?.closest(
          "input, textarea, select, button, [contenteditable=true], [role=slider], [role=dialog]",
        )
      )
        return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [track, toggle]);

  const onEnded = (audio: HTMLAudioElement) => {
    const restart = () => {
      audio.currentTime = 0;
      audio.play().catch(() => undefined);
    };
    if (repeat === "one") return restart();
    const before = useArtistPlayerStore.getState().index;
    next(true);
    // Same song again (a one-song queue on repeat / shuffle): nothing reloads, so replay it.
    const after = useArtistPlayerStore.getState();
    if (after.playing && after.index === before) restart();
  };

  const audio = (
    <audio
      ref={audioRef}
      preload="auto"
      onLoadedMetadata={(e) => {
        setDuration(e.currentTarget.duration || 0);
        e.currentTarget.volume = muted ? 0 : volume;
      }}
      onEmptied={() => {
        setTime(0);
        setDuration(0);
      }}
      onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
      onEnded={(e) => onEnded(e.currentTarget)}
    />
  );

  // Same tree shape with or without a song, so the audio element is never remounted.
  if (!track) return <>{audio}</>;

  const seek = (sec: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = sec;
    setTime(sec);
  };
  const onPrev = () => {
    if (time > RESTART_AFTER_SEC || queue.length < 2) seek(0);
    else prev();
  };
  const VolumeIcon =
    muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      {audio}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b0a10]/95 backdrop-blur-xl">
        <div className="mx-auto grid h-20 max-w-[1800px] grid-cols-[1fr_auto] items-center gap-4 px-4 sm:grid-cols-[1fr_minmax(0,1.6fr)_1fr] sm:px-6">
          {/* Now playing */}
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="size-14 shrink-0 rounded-lg shadow-lg"
              style={{ background: track.cover }}
            />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[15px] font-semibold text-white">
                {track.title}
              </span>
              <span className="truncate text-xs text-white/55">
                {track.subtitle}
              </span>
            </span>
            {track.mediaId && (
              <button
                type="button"
                aria-label={track.liked ? "Unlike" : "Like"}
                aria-pressed={!!track.liked}
                onClick={() => {
                  toggleLike.mutate({
                    id: track.mediaId!,
                    liked: !track.liked,
                  });
                  setLiked(track.id, !track.liked);
                }}
                className={cn(
                  iconButton,
                  "shrink-0",
                  track.liked && "text-secondary hover:text-secondary",
                )}
              >
                <Heart
                  className="size-5"
                  fill={track.liked ? "currentColor" : "none"}
                />
              </button>
            )}
          </div>

          {/* Controls + progress */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={toggleShuffle}
                aria-label="Shuffle"
                aria-pressed={shuffle}
                className={cn(
                  iconButton,
                  "hidden sm:flex",
                  shuffle && "text-primary hover:text-primary",
                )}
              >
                <Shuffle className="size-[18px]" />
              </button>
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous"
                className={cn(iconButton, "hidden sm:flex")}
              >
                <SkipBack className="size-5" fill="currentColor" />
              </button>
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
                className="flex size-11 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 active:scale-95"
              >
                {playing ? (
                  <Pause className="size-5" fill="currentColor" />
                ) : (
                  <Play className="size-5 translate-x-px" fill="currentColor" />
                )}
              </button>
              <button
                type="button"
                onClick={() => next()}
                disabled={queue.length < 2}
                aria-label="Next"
                className={iconButton}
              >
                <SkipForward className="size-5" fill="currentColor" />
              </button>
              <button
                type="button"
                onClick={cycleRepeat}
                aria-label={`Repeat: ${repeat}`}
                className={cn(
                  iconButton,
                  "hidden sm:flex",
                  repeat !== "off" && "text-primary hover:text-primary",
                )}
              >
                {repeat === "one" ? (
                  <Repeat1 className="size-[18px]" />
                ) : (
                  <Repeat className="size-[18px]" />
                )}
              </button>
            </div>
            <div className="hidden w-full items-center gap-3 sm:flex">
              <span className="w-10 text-right text-xs tabular-nums text-white/55">
                {formatDuration(time)}
              </span>
              <Bar
                value={time}
                max={duration}
                onChange={seek}
                label="Seek"
                className="flex-1"
              />
              <span className="w-10 text-xs tabular-nums text-white/55">
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Volume */}
          <div className="hidden items-center justify-end gap-2 sm:flex">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className={iconButton}
            >
              <VolumeIcon className="size-5" />
            </button>
            <Bar
              value={muted ? 0 : volume}
              max={1}
              onChange={setVolume}
              label="Volume"
              className="w-32"
            />
          </div>
        </div>

        {/* Mobile: progress as a hairline on top of the bar. */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-white/10 sm:hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${duration ? (time / duration) * 100 : 0}%` }}
          />
        </div>
      </div>
    </>
  );
}
