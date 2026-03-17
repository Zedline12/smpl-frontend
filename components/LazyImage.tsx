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

export default function LazyImage({
  src,
  options: {aspectRatio="1:1",width,height},
}: {
        src: string;
        options: {
           aspectRatio?: AspectRatio; 
           width?: number;
           height?: number;
    }
}) {
  const [loaded, setLoaded] = useState(false);

  return (
      <div
          style={{
           
            height
          }}
      className={`relative w-full ${aspectMap[aspectRatio]}  rounded-xl overflow-hidden bg-gray-200`}
    >
      {/* Skeleton UNDER the image */}
      <div className="absolute inset-0 animate-pulse bg-gray-300" />

      {/* Image OVER the skeleton */}
      <img
        src={src}
        loading="lazy"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300`}
      />
    </div>
  );
}
