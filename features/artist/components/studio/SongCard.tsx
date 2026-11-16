"use client";
import type { ReactNode } from "react";
import { MoreHorizontal, Pause, Play } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MENU_CONTENT_CLASS } from "@/features/media/components/actions/MediaCardActions";
import { cn } from "@/lib/utils";
import type { Track } from "../../stores/useArtistPlayerStore";
import { Equalizer } from "./Equalizer";

export const shelfCard =
  "group relative flex flex-col gap-3 rounded-2xl border p-3 text-left transition-colors";

/** A song in the shelf: cover, title, artist line. Click plays it in the bar. */
export function SongCard({
  track,
  current,
  playing,
  onPlay,
  menu,
}: {
  track: Track;
  /** It's the song in the player bar. */
  current: boolean;
  playing: boolean;
  onPlay: () => void;
  /** Items for the ⋯ menu. */
  menu?: ReactNode;
}) {
  const live = current && playing;
  return (
    <div
      className={cn(
        shelfCard,
        current
          ? "border-primary/60 bg-primary/[0.08]"
          : "border-white/[0.05] bg-white/[0.03] hover:bg-white/[0.07]",
      )}
    >
      <button type="button" onClick={onPlay} aria-label={live ? `Pause ${track.title}` : `Play ${track.title}`} className="relative block aspect-square w-full overflow-hidden rounded-xl shadow-[0_12px_30px_-14px_rgba(0,0,0,0.9)]" style={{ background: track.cover }}>
        {current && (
          <span className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-lg bg-black/55 backdrop-blur-sm">
            <Equalizer active={live} bars={3} className="h-4" />
          </span>
        )}
        <span
          className={cn(
            "absolute right-2.5 bottom-2.5 flex size-12 items-center justify-center rounded-full text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.8)] transition-all",
            live
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100",
          )}
          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
        >
          {live ? <Pause className="size-5" fill="currentColor" /> : <Play className="size-5 translate-x-px" fill="currentColor" />}
        </span>
      </button>

      <div className="flex min-w-0 items-start gap-2 px-0.5">
        <button type="button" onClick={onPlay} className="flex min-w-0 flex-1 flex-col text-left">
          <span className={cn("truncate text-sm font-semibold", current ? "text-primary" : "text-white")}>{track.title}</span>
          <span className="truncate text-xs text-white/50">{track.subtitle}</span>
        </button>
        {menu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More"
                className="-mr-1 flex size-7 shrink-0 items-center justify-center rounded-full text-white/50 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10 hover:text-white focus-visible:opacity-100 data-[state=open]:opacity-100"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`${MENU_CONTENT_CLASS} w-44`}>
              {menu}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
