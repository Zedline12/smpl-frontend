"use client";

import { cn } from "@/lib/utils";

/**
 * A reference image or video shown whole (never cropped or stretched): the media is
 * contained and centred, with a blurred copy filling the rest of the tile.
 */
export function MediaThumb({
  url,
  type = "image",
  alt = "",
  play = false,
  className,
}: {
  url: string;
  type?: "image" | "video";
  alt?: string;
  /** Loop the video silently (large previews). */
  play?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-black", className)}>
      {type === "video" ? (
        <>
          <video src={url} muted playsInline preload="metadata" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-md" />
          <video src={url} muted playsInline preload="metadata" loop={play} autoPlay={play} className="relative h-full w-full object-contain" />
        </>
      ) : (
        <>
          <img loading="lazy" decoding="async" src={url} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-md" />
          <img loading="lazy" decoding="async" src={url} alt={alt} className="relative h-full w-full object-contain" />
        </>
      )}
    </div>
  );
}
