"use client";
import { PointerEvent as ReactPointerEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";
import type { Media } from "@/features/media/types/media";
import { Loader2, Music2, Pause, Play, Upload, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MENU_CONTENT_CLASS } from "@/features/media/components/actions/MediaCardActions";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { Seedance25RefLimits } from "@/features/generation/types/models/seedance-2.5-ref-to-video.type";
import { useInfiniteMediaQuery } from "@/features/media/queries/media";
import { createMediaFilters } from "@/features/media/types/media-filters";
import { clipSongInfo, type ClipSongInfo } from "../data/clip-scene";
import { decodeAudio, peaksFromBuffer } from "../utils/audio-clip";
import { formatDuration } from "../utils/composition-plan";
import { songCover, songSubtitle, songTitle } from "../utils/song-meta";

export interface AudioSource {
  url: string;
  name: string;
  /** Object URLs (uploads) are revoked when replaced. */
  local?: boolean;
  /** A song from My songs: its mood and Background sounds (the clip's scene picks follow them). */
  song?: ClipSongInfo;
}

export interface AudioWindow {
  source: AudioSource;
  startSec: number;
  lengthSec: number;
}

interface AudioWindowPickerProps {
  value: AudioWindow | null;
  onChange: (next: AudioWindow | null) => void;
  disabled?: boolean;
  /** The longest part that can be picked (default 30 s). */
  maxSeconds?: number;
  /** Smaller tiles (the phone dock). */
  compact?: boolean;
}

const BARS = 72;
const DEFAULT_LENGTH_SEC = 15;
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const { minDurationSec: MIN_SEC, maxDurationSec: DEFAULT_MAX_SEC } = Seedance25RefLimits;
const SONG_FILTERS = createMediaFilters(AiModelsEnum.ELEVENLABS_MUSIC_V2_5);

/** The two choices: square tiles. */
const TILE =
  "group relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-3xl border bg-white/[0.03] p-3 text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.06] hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)] disabled:pointer-events-none disabled:opacity-40";

function TileLabel({
  icon,
  title,
  hint,
  compact,
  ring,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  compact?: boolean;
  /** The icon circle's glow (a Tailwind from- color); none on a picked song's cover. */
  ring?: string;
}) {
  return (
    <span className="flex w-full flex-col items-center gap-2 text-center">
      <span
        className={cn(
          "flex items-center justify-center rounded-full border border-white/10 transition-transform group-hover:scale-105",
          compact ? "size-10" : "size-14",
          ring ? `bg-gradient-to-br ${ring} to-transparent` : "bg-black/30 backdrop-blur",
        )}
      >
        {icon}
      </span>
      <span className={cn("w-full truncate font-semibold", compact ? "text-xs" : "text-sm")}>{title}</span>
      <span className="w-full truncate text-[11px] text-white/50">{hint}</span>
    </span>
  );
}

/** A song's length: from its input when known, else read from the file. */
function SongLength({ song }: { song: Media }) {
  const fromInput = songSeconds(song.input);
  const [probed, setProbed] = useState<number | null>(null);
  useEffect(() => {
    if (fromInput) return;
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => Number.isFinite(audio.duration) && setProbed(audio.duration);
    audio.src = song.url;
    return () => {
      audio.onloadedmetadata = null;
      audio.src = "";
    };
  }, [fromInput, song.url]);
  const seconds = fromInput ?? probed;
  return (
    <span className="text-[11px] font-medium text-white/70 tabular-nums">
      {seconds ? formatDuration(seconds) : "–:––"}
    </span>
  );
}

/** ElevenLabs Music: a plan's sections added up, or the prompt mode's length. */
function songSeconds(input: Record<string, unknown> | undefined): number | null {
  const sections = input?.sections as { durationSec?: number }[] | undefined;
  if (input?.mode === "plan" && Array.isArray(sections)) {
    const total = sections.reduce((n, s) => n + (Number(s.durationSec) || 0), 0);
    if (total > 0) return total;
  }
  const ms = Number(input?.musicLengthMs);
  return ms > 0 ? ms / 1000 : null;
}

/** Pick a song (or upload one) and choose up to 30 seconds of it for the clip. */
export function AudioWindowPicker({
  value,
  onChange,
  disabled,
  maxSeconds: MAX_SEC = DEFAULT_MAX_SEC,
  compact,
}: AudioWindowPickerProps) {
  const source = value?.source ?? null;
  const fileRef = useRef<HTMLInputElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const drag = useRef<{ mode: "move" | "start" | "end"; offset: number } | null>(null);

  const [decoded, setDecoded] = useState<
    { url: string; duration: number; peaks: number[] } | { url: string; failed: true } | null
  >(null);
  // Length from the <audio> element; works even when the file can't be fetched for decoding.
  const [meta, setMeta] = useState<{ url: string; duration: number } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const songs = useInfiniteMediaQuery({ type: "audio", filters: SONG_FILTERS, limit: 20 });
  const songList = songs.data?.pages.flatMap((p) => p.data ?? []) ?? [];
  const pickedSong = source && !source.local ? songList.find((s) => s.url === source.url) : undefined;

  // Decode the chosen audio once for its length and waveform.
  const sourceUrl = source?.url;
  useEffect(() => {
    if (!sourceUrl) return;
    let cancelled = false;
    decodeAudio(sourceUrl)
      .then((buffer) => {
        if (!cancelled)
          setDecoded({ url: sourceUrl, duration: buffer.duration, peaks: peaksFromBuffer(buffer, BARS) });
      })
      .catch(() => {
        if (!cancelled) setDecoded({ url: sourceUrl, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [sourceUrl]);

  // Only trust a decode result that belongs to the current source.
  const current = decoded && decoded.url === sourceUrl ? decoded : null;
  const decodeFailed = !!current && "failed" in current;
  const metaDuration = meta && meta.url === sourceUrl ? meta.duration : null;
  const duration = (current && "duration" in current ? current.duration : null) ?? metaDuration;
  // Without a decoded waveform, draw even bars so the part can still be picked.
  const peaks =
    current && "peaks" in current
      ? current.peaks
      : decodeFailed && duration
        ? Array.from({ length: BARS }, (_, i) => 0.35 + 0.25 * Math.abs(Math.sin(i * 0.7)))
        : null;
  const loading = !!sourceUrl && duration === null && !decodeFailed;
  const error =
    fileError ??
    (decodeFailed && metaDuration === null ? "Couldn't read this audio. Try another file." : null);

  // Free an uploaded file's object URL when it's replaced or removed.
  const releaseSource = () => {
    audioRef.current?.pause();
    if (source?.local) URL.revokeObjectURL(source.url);
  };

  // Once the length is known, fit a window inside it.
  const tooShort = duration !== null && duration < MIN_SEC;
  const maxLength = duration ? Math.min(MAX_SEC, Math.floor(duration)) : MAX_SEC;
  useEffect(() => {
    if (!value || duration === null || tooShort) return;
    const lengthSec = Math.min(Math.max(value.lengthSec, MIN_SEC), maxLength);
    const startSec = Math.min(Math.max(0, value.startSec), Math.max(0, duration - lengthSec));
    if (lengthSec !== value.lengthSec || startSec !== value.startSec) {
      onChange({ ...value, lengthSec, startSec });
    }
  }, [value, duration, maxLength, tooShort, onChange]);

  // Stop the preview at the end of the window.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !value) return;
    const end = value.startSec + value.lengthSec;
    const onTime = () => {
      if (audio.currentTime >= end) audio.pause();
    };
    audio.addEventListener("timeupdate", onTime);
    return () => audio.removeEventListener("timeupdate", onTime);
  }, [value]);

  const pickSource = (next: AudioSource) => {
    setFileError(null);
    releaseSource();
    onChange({ source: next, startSec: 0, lengthSec: Math.min(DEFAULT_LENGTH_SEC, MAX_SEC) });
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!/^audio\/(mpeg|mp3|wav|x-wav|wave)$/.test(file.type) && !/\.(mp3|wav)$/i.test(file.name)) {
      setFileError("Use an MP3 or WAV file.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setFileError("That file is over 50 MB.");
      return;
    }
    pickSource({ url: URL.createObjectURL(file), name: file.name, local: true });
  };

  const togglePreview = () => {
    const audio = audioRef.current;
    if (!audio || !value) return;
    if (!audio.paused) return audio.pause();
    audio.currentTime = value.startSec;
    audio.play().catch(() => undefined);
  };

  // Drag the window to move it, drag its edges to resize it, or click elsewhere to jump there.
  const secondsAt = (clientX: number) => {
    const rect = waveRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !duration) return 0;
    return Math.min(Math.max(0, ((clientX - rect.left) / rect.width) * duration), duration);
  };
  const moveTo = (startSec: number) => {
    if (!value || !duration) return;
    const clamped = Math.min(Math.max(0, startSec), Math.max(0, duration - value.lengthSec));
    const next = Math.round(clamped * 10) / 10;
    if (next !== value.startSec) onChange({ ...value, startSec: next });
  };
  const resize = (edge: "start" | "end", at: number) => {
    if (!value || !duration) return;
    const end = value.startSec + value.lengthSec;
    if (edge === "end") {
      const room = Math.min(maxLength, Math.floor(duration - value.startSec));
      const lengthSec = Math.min(Math.max(Math.round(at - value.startSec), MIN_SEC), room);
      if (lengthSec !== value.lengthSec) onChange({ ...value, lengthSec });
    } else {
      const lengthSec = Math.min(Math.max(Math.round(end - at), MIN_SEC), maxLength, Math.floor(end));
      const startSec = Math.round((end - lengthSec) * 10) / 10;
      if (lengthSec !== value.lengthSec || startSec !== value.startSec)
        onChange({ ...value, lengthSec, startSec });
    }
  };
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!value || !duration || disabled || e.button !== 0) return;
    e.preventDefault();
    const at = secondsAt(e.clientX);
    const handle = (e.target as HTMLElement).closest<HTMLElement>("[data-handle]")?.dataset.handle;
    if (handle === "start" || handle === "end") {
      drag.current = { mode: handle, offset: 0 };
    } else {
      const inside = at >= value.startSec && at <= value.startSec + value.lengthSec;
      const offset = inside ? at - value.startSec : value.lengthSec / 2;
      drag.current = { mode: "move", offset };
      if (!inside) moveTo(at - offset);
    }
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const at = secondsAt(e.clientX);
    if (d.mode === "move") moveTo(at - d.offset);
    else resize(d.mode, at);
  };
  const endDrag = () => {
    drag.current = null;
  };

  const ready = !!value && !!duration && !tooShort;
  const left = ready ? (value.startSec / duration) * 100 : 0;
  const width = ready ? (value.lengthSec / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className={cn("grid grid-cols-2 gap-3", !compact && "mx-auto w-full max-w-sm")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled}>
            <button
              type="button"
              className={cn(
                TILE,
                "data-[state=open]:border-primary/60",
                pickedSong ? "border-primary/50" : "border-white/10",
              )}
              style={pickedSong ? { background: songCover(pickedSong.id) } : undefined}
            >
              {pickedSong ? (
                <TileLabel
                  icon={<Music2 className="size-5" />}
                  title={songTitle(pickedSong.input)}
                  hint="Tap to change"
                  compact={compact}
                />
              ) : (
                <TileLabel
                  icon={<Music2 className="text-primary size-6" />}
                  title="My songs"
                  hint={songList.length ? `${songList.length}${songs.hasNextPage ? "+" : ""} songs` : "Songs you made"}
                  compact={compact}
                  ring="from-primary/30"
                />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={compact ? "top" : "left"}
            align="start"
            sideOffset={10}
            collisionPadding={12}
            className={`${MENU_CONTENT_CLASS} max-h-[60vh] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto p-1.5`}
          >
            <DropdownMenuLabel className="px-2 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Your songs
            </DropdownMenuLabel>
            {songs.isLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="size-4 animate-spin text-white/50" />
              </div>
            )}
            {!songs.isLoading && songList.length === 0 && (
              <p className="px-2 py-3 text-xs text-white/45">No songs yet. Make one in the Create song tab.</p>
            )}
            {songList.map((song) => (
              <DropdownMenuItem
                key={song.id}
                onSelect={() =>
                  pickSource({ url: song.url, name: songTitle(song.input), song: clipSongInfo(song.input) })
                }
                className={cn(
                  "flex items-center gap-3 rounded-lg p-2 focus:bg-white/10 focus:text-white",
                  song.url === source?.url && "bg-primary/15",
                )}
              >
                <span
                  className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-[0_8px_20px_-10px_rgba(0,0,0,0.9)]"
                  style={{ background: songCover(song.id) }}
                >
                  <Music2 className="size-4 text-white/80" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[13px] font-semibold text-white/90">{songTitle(song.input)}</span>
                  <span className="truncate text-[11px] text-white/45">{songSubtitle(song.input)}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5">
                  <SongLength song={song} />
                  <span className="text-[10px] text-white/40">
                    {formatDistanceToNowStrict(new Date(song.createdAt), { addSuffix: true })}
                  </span>
                </span>
              </DropdownMenuItem>
            ))}
            {songs.hasNextPage && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  songs.fetchNextPage();
                }}
                className="justify-center text-xs text-white/50 focus:bg-white/10 focus:text-white"
              >
                {songs.isFetchingNextPage ? "Loading…" : "Show more"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          className={cn(TILE, source?.local ? "border-secondary/50 bg-secondary/10" : "border-dashed border-white/15")}
        >
          <TileLabel
            icon={<Upload className="text-secondary size-6" />}
            title={source?.local ? source.name : "Upload"}
            hint={source?.local ? "Tap to change" : "MP3 or WAV · 50 MB"}
            compact={compact}
            ring="from-secondary/30"
          />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/mpeg,audio/wav,.mp3,.wav"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {source && (
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePreview}
              disabled={!ready}
              aria-label={playing ? "Pause preview" : "Play the selected part"}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
            >
              {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5 translate-x-px" />}
            </button>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-white/85">{source.name}</span>
            <button
              type="button"
              onClick={() => {
                releaseSource();
                onChange(null);
              }}
              aria-label="Remove audio"
              className="flex size-6 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div
            ref={waveRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onLostPointerCapture={endDrag}
            className={`relative h-14 touch-none select-none ${ready ? "cursor-grab active:cursor-grabbing" : ""}`}
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="size-4 animate-spin text-white/50" />
              </div>
            )}
            {peaks && (
              <div className="absolute inset-0 flex items-center gap-[2px]">
                {peaks.map((p, i) => {
                  const at = ((i + 0.5) / BARS) * 100;
                  const inWindow = ready && at >= left && at <= left + width;
                  return (
                    <span
                      key={i}
                      className="flex-1 rounded-full"
                      style={{
                        height: `${Math.max(8, p * 100)}%`,
                        background: inWindow
                          ? "linear-gradient(to top, var(--color-primary), var(--color-secondary))"
                          : "rgba(255,255,255,0.18)",
                      }}
                    />
                  );
                })}
              </div>
            )}
            {ready && (
              <div
                className="border-secondary/70 bg-primary/10 absolute inset-y-0 rounded-md border"
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                {(["start", "end"] as const).map((edge) => (
                  <span
                    key={edge}
                    data-handle={edge}
                    aria-hidden
                    className={`group/handle absolute inset-y-0 flex w-3 cursor-ew-resize items-center justify-center ${
                      edge === "start" ? "-left-1.5" : "-right-1.5"
                    }`}
                  >
                    <span className="bg-secondary h-6 w-1 rounded-full shadow-[0_0_8px_var(--color-secondary)] transition-transform group-hover/handle:scale-y-125" />
                  </span>
                ))}
              </div>
            )}
          </div>

          {ready && (
            <>
              <div className="flex justify-between text-[10px] tabular-nums text-white/45">
                <span>{formatDuration(value.startSec)}</span>
                <span className="text-white/70">{value.lengthSec}s selected</span>
                <span>{formatDuration(value.startSec + value.lengthSec)}</span>
              </div>
              <label className="flex items-center gap-3 text-[11px] text-white/55">
                Length
                <input
                  type="range"
                  min={MIN_SEC}
                  max={maxLength}
                  step={1}
                  value={value.lengthSec}
                  disabled={disabled}
                  onChange={(e) => {
                    const lengthSec = Number(e.target.value);
                    const startSec = Math.min(value.startSec, Math.max(0, duration - lengthSec));
                    onChange({ ...value, lengthSec, startSec });
                  }}
                  className="accent-primary flex-1"
                />
                <span className="w-7 text-right tabular-nums text-white/80">{value.lengthSec}s</span>
              </label>
            </>
          )}

          <audio
            ref={audioRef}
            src={source.url}
            preload="metadata"
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration;
              if (Number.isFinite(d) && d > 0) setMeta({ url: source.url, duration: d });
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
        </div>
      )}

      {tooShort && <p className="text-[11px] text-red-400/90">Pick audio at least {MIN_SEC} seconds long.</p>}
      {error && <p className="text-[11px] text-red-400/90">{error}</p>}
      {!source && !error && (
        <p className="text-[11px] text-white/40">
          Choose one of your songs or upload an MP3/WAV, then pick up to {MAX_SEC} seconds of it.
        </p>
      )}
    </div>
  );
}
