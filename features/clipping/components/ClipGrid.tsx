"use client";

import { useState } from "react";
import { Film } from "lucide-react";
import { VideoClip } from "../types";
import { ClipCard } from "./ClipCard";
import { ClipPreviewDialog } from "./ClipPreviewDialog";

/** Only mount this many <video> elements up front; a project can hold 100. */
const INITIAL_VISIBLE = 12;
const PAGE_SIZE = 12;

export function ClipGrid({ clips }: { clips: VideoClip[] }) {
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [selected, setSelected] = useState<VideoClip | null>(null);

  if (!clips.length) {
    return (
      <div className="border-border bg-card rounded-2xl border border-dashed py-16 text-center">
        <div className="bg-muted text-muted-foreground mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
          <Film className="size-8" />
        </div>
        <h3 className="text-foreground text-lg font-semibold">No clips yet</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          This project finished without producing any clips.
        </p>
      </div>
    );
  }

  const shown = clips.slice(0, visible);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {shown.map((clip) => (
          <ClipCard
            key={clip.providerVideoId}
            clip={clip}
            onOpen={setSelected}
          />
        ))}
      </div>

      {visible < clips.length && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <p className="text-muted-foreground text-sm">
            Showing {shown.length} of {clips.length}
          </p>
          <button
            type="button"
            onClick={() => setVisible((current) => current + PAGE_SIZE)}
            className="btn btn-ghost btn-sm"
          >
            Show more
          </button>
        </div>
      )}

      <ClipPreviewDialog
        clip={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
