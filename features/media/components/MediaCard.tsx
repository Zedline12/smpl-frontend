"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Media } from "@/features/media/types/media";
import LazyImage from "@/components/LazyImage";
import LazyVideo from "@/components/LazyVideo";
import { downloadFile } from "@/lib/handle-downloads";
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { MediaEditDialog } from "./MediaEditDialog";
import { useAuth } from "@/providers/AuthProvider";

export function MediaCard({
  media,
  width,
  height,
  isUpdating = false,
}: {
  media: Media;
  width: number;
  height: number;
  isUpdating?: boolean;
}) {
  // const { user } = useAuth();
  // console.log(user);
  const router = useRouter();
  const [duration, setDuration] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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
        onClick={() => (setPreviewOpen(true) )}
        className="cursor-pointer w-full group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
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

        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
          <div className="flex items-center justify-end text-white">
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(media.url, media.id);
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
      </div>

      <MediaPreviewDialog
        media={media}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onEditOpen={() => {
          setPreviewOpen(false);
          setEditOpen(true);
        }}
      />

      <MediaEditDialog
        media={media}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
