"use client";
import { AspectRatio, Media } from "@/features/media/types/media";
import { MediaCard } from "@/features/media/components/MediaCard";
import Masonry from "react-masonry-css";
import { calculateHeight } from "@/lib/utils";
type MediaGridProps = {
  media: Media[];
  layout?: "masonry" | "grid";
  imagesWidth?: number,
  breakpointCols?: number | { default: number, [key: number]: number } | { [key: number]: number };
  aspectRatio?:AspectRatio
};

export function MediaGrid({ media, layout = "masonry", imagesWidth = 270, aspectRatio = "1:1", breakpointCols }: MediaGridProps) {
  if (!media.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-primary-foreground text-lg">Start Generating !</p>
      </div>
    )
  }
  if (layout === "grid") {
    return (
      <div className=" p-4  min-h-[calc(100vh-600px)]">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-5 gap-6">
          {media.map((item) => (
            <MediaCard key={item.id} media={item} width={imagesWidth} height={calculateHeight(aspectRatio, imagesWidth)} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={{ default: 6,1600:5, 1450:4, 1200: 3, 940: 2 }}
      className="flex gap-1 "
      columnClassName="space-y-3 "
    
    >
      {media.map((m) => (
        <MediaCard
          key={m.id}
          media={m}
          width={imagesWidth}
          height={calculateHeight(m.aspectRatio, imagesWidth)}
        />
      ))}
    </Masonry>
  );
}
