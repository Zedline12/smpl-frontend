"use client";
import React from "react";
import { Media } from "@/features/media/types/media";
import { MediaCard } from "@/features/media/components/MediaCard";
import { fetchWithToken } from "@/lib/fetcher";
import { PromptInput } from "@/features/ai-media/components/prompt-input";

export function MediaGrid({ media }: { media: Media[] }) {
  if (media.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-gray-500">No media yet. Start generating!</p>
      </div>
    );
  }

  return (
    <div className=" p-4 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {media.map((item) => (
          <MediaCard key={item.id} media={item} />
        ))}
      </div>
    </div>
  );
}
