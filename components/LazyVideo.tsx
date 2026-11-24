"use client";
import { AspectRatio } from "@/features/media/types/media";
import { useState } from "react";
import { useInViewPlay } from "@/hooks/useInViewPlay";

const aspectMap: Record<AspectRatio, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "3:4": "aspect-[3/4]",
  "9:16": "aspect-[9/16]",
  "5:4": "aspect-[5/4]",
};

/**
 * A grid video. Autoplaying previews only load and play while on screen (pausing when
 * they scroll away); until then the poster (the small first-frame thumbnail) shows.
 * Videos with controls load just their metadata until played.
 */
export default function LazyVideo({
  src,
  poster,
  options: {
    aspectRatio = "16:9",
    height,
    autoplay = false,
    loop = false,
    muted = false,
    controls = true,
  },
}: {
  src: string;
  poster?: string | null;
  options: {
    aspectRatio?: AspectRatio;
    width?: number;
    height?: number;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
  };
}) {
  const [loaded, setLoaded] = useState(false);
  const { ref, seen } = useInViewPlay<HTMLVideoElement>(autoplay);

  return (
    <div style={{ height }} className={`relative w-full ${aspectMap[aspectRatio]} overflow-hidden rounded-xl bg-white/[0.04]`}>
      {!loaded && !poster && <div className="absolute inset-0 animate-pulse bg-white/[0.06]" />}
      <video
        ref={ref}
        src={src}
        poster={poster ?? undefined}
        loop={loop}
        muted={muted || autoplay}
        controls={controls}
        playsInline
        // Previews: nothing until on screen. Others: just enough to show the length / a frame.
        preload={autoplay ? (seen ? "auto" : "none") : "metadata"}
        className="absolute inset-0 h-full w-full object-cover"
        onLoadedData={() => setLoaded(true)}
      />
    </div>
  );
}
