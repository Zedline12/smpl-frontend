"use client";
import { AspectRatio } from "@/features/media/types/media";
import { useState } from "react";

const aspectMap: Record<AspectRatio, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "3:4": "aspect-[3/4]",
  "9:16": "aspect-[9/16]",
  "5:4": "aspect-[5/4]",
};

/**
 * A grid image: loads only near the viewport, decodes off the main thread, and fades
 * in over a skeleton. Pass the thumbnail as `src` (with the original as `fallback`
 * for older media whose thumbnail failed to load).
 */
export default function LazyImage({
  src,
  fallback,
  options: { aspectRatio = "1:1", height },
}: {
  src: string;
  fallback?: string;
  options: {
    aspectRatio?: AspectRatio;
    width?: number;
    height?: number;
  };
}) {
  const [loaded, setLoaded] = useState(false);
  const [current, setCurrent] = useState(src);
  if (current !== src && current !== fallback) setCurrent(src);

  return (
    <div style={{ height }} className={`relative w-full ${aspectMap[aspectRatio]} overflow-hidden rounded-xl bg-white/[0.04]`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-white/[0.06]" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (fallback && current !== fallback) setCurrent(fallback);
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
