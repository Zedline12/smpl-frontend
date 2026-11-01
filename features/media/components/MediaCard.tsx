"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Media, MediaDisplayVariant } from "@/features/media/types/media";
import { WaveformPlayer } from "@/features/artist/components/WaveformPlayer";
import LazyImage from "@/components/LazyImage";
import LazyVideo from "@/components/LazyVideo";
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { MediaEditDialog } from "./MediaEditDialog";
import { Check, Heart } from "lucide-react";
import { MediaCardActions } from "./actions/MediaCardActions";
import { useMediaSelectionStore } from "../stores/useMediaSelectionStore";
import { useDownloadMedia } from "../hooks/useMediaActions";

export function MediaCard({
  media,
  width,
  height,
  isUpdating = false,
  actions = false,
  template = false,
  variant = "default",
}: {
  variant?: MediaDisplayVariant;
  media: Media;
  width: number;
  height: number;
  isUpdating?: boolean;
  /** Show the like / download / ⋯ overlay and allow select mode. */
  actions?: boolean;
  /** A template: no overlay, and opening it shows only Recreate. */
  template?: boolean;
}) {
  // const { user } = useAuth();
  // console.log(user);
  const router = useRouter();
  const [duration, setDuration] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const selecting = useMediaSelectionStore((s) => actions && s.active);
  const selected = useMediaSelectionStore((s) => s.ids.has(media.id));
  const toggleSelected = useMediaSelectionStore((s) => s.toggle);
  const download = useDownloadMedia();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) return `${mins}:${secs.toString().padStart(2, "0")}`;
    return `${secs}s`;
  };

  return (
    <>
      {/* Card thumbnail */}
      <div
        style={{ height }}
        onClick={() =>
          selecting ? toggleSelected(media.id) : setPreviewOpen(true)
        }
        className={`cursor-pointer w-full group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
          selecting && selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
        }`}
      >
        <div className="relative h-full">
          {media.type === "video" ? (
            <LazyVideo
              src={media.url}
              options={{
                aspectRatio: media.aspectRatio,
                width,
                height,
                autoplay: true,
                loop: true,
                muted: true,
                controls: false,
              }}
            />
          ) : media.type === "audio" && variant === "music" ? (
            <div
              className="h-full w-full overflow-hidden rounded-xl border border-white/[0.07]"
              style={{
                background:
                  "radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent 60%), radial-gradient(120% 90% at 100% 100%, color-mix(in srgb, var(--color-secondary) 14%, transparent), transparent 60%), rgba(255,255,255,0.03)",
              }}
            >
              <WaveformPlayer src={media.url} />
            </div>
          ) : media.type === "audio" ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800/50 rounded-xl overflow-hidden border border-white/5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 text-white/20 mb-3"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
              <span className="text-white/50 text-sm font-medium tracking-wide w-full text-center truncate px-4">
                {duration !== null ? formatDuration(duration) : "Loading..."}
              </span>
              <audio
                src={media.url}
                className="hidden"
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              />
            </div>
          ) : (
            <LazyImage
              key={media.id}
              src={media.url}
              options={{ aspectRatio: media.aspectRatio, width, height }}
            />
          )}
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />

        {isUpdating && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-xl pointer-events-none">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          </div>
        )}

        {template ? null : actions ? (
          selecting ? (
            <span
              className={`absolute top-2 left-2 z-20 flex size-6 items-center justify-center rounded-full border-2 transition-colors ${
                selected ? "border-primary bg-primary" : "border-white/80 bg-black/30"
              }`}
            >
              {selected && <Check className="size-3.5 text-white" />}
            </span>
          ) : (
            <>
              {media.liked && (
                <Heart className="absolute top-3 right-3 z-10 size-4 fill-red-500 text-red-500 drop-shadow transition-opacity group-hover:opacity-0" />
              )}
              <MediaCardActions media={media} onOpen={() => setPreviewOpen(true)} />
            </>
          )
        ) : (
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
            <div className="flex items-center justify-end text-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  download([media]);
                }}
                className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <MediaPreviewDialog
        media={media}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={template}
        variant={variant}
        onEditOpen={
          template
            ? undefined
            : () => {
                setPreviewOpen(false);
                setEditOpen(true);
              }
        }
      />

      {!template && (
        <MediaEditDialog
          media={media}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}
