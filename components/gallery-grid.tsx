import React from "react";
import { Media } from "@/lib/types/project.type";
import { MediaCard } from "./media-card";

interface GalleryGridProps {
  media?: Media[];
}

export function GalleryGrid({ media = [] }: GalleryGridProps) {
  if (media.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-gray-500">No media yet. Start generating!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((item) => (
          <MediaCard key={item.id} media={item} />
        ))}
      </div>
    </div>
  );
}
