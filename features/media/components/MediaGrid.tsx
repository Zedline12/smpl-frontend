"use client";
import { AspectRatio, Media, MediaDisplayVariant } from "@/features/media/types/media";
import { MediaCard } from "@/features/media/components/MediaCard";
import Masonry from "react-masonry-css";
import { calculateHeight } from "@/lib/utils";
type MediaGridProps = {
  media: Media[];
  layout?: "masonry" | "grid";
  imagesWidth?: number;
  breakpointCols?: number | { default: number; [key: number]: number } | { [key: number]: number };
  aspectRatio?: AspectRatio;
  updatingMediaIds?: Set<string>;
  /** Enables the per-tile action overlay and select mode. */
  actions?: boolean;
  /** Template tiles (Explore): no overlay, open with Recreate only. */
  template?: boolean;
  /** "music" renders songs as waveform players (Artist page). */
  variant?: MediaDisplayVariant;
  /** Message when there's nothing to show. */
  emptyMessage?: string;
};

export function MediaGrid({
  media,
  layout = "masonry",
  imagesWidth = 270,
  aspectRatio = "1:1",
  breakpointCols = { default: 6, 1600: 5, 1450: 4, 1200: 3, 940: 2 },
  updatingMediaIds,
  actions = false,
  template = false,
  emptyMessage = "Start Generating !",
  variant = "default",
}: MediaGridProps) {
  if (!media.length) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <p className="text-primary-foreground text-lg">{emptyMessage}</p>
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div className="p-4 min-h-[calc(100vh-600px)]">
        <div
          className={
            actions || template
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5"
              : "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-5 gap-6"
          }
        >
          {media.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              width={imagesWidth}
              height={calculateHeight(aspectRatio, imagesWidth)}
              isUpdating={updatingMediaIds?.has(item.id) ?? false}
              actions={actions}
              template={template}
              variant={variant}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={breakpointCols}
      className="flex gap-1"
      columnClassName="space-y-3"
    >
      {media.map((m) => (
        <MediaCard
          key={m.id}
          media={m}
          width={imagesWidth}
          height={calculateHeight(m.aspectRatio, imagesWidth)}
          isUpdating={updatingMediaIds?.has(m.id) ?? false}
          actions={actions}
          variant={variant}
        />
      ))}
    </Masonry>
  );
}
