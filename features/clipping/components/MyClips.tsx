"use client";

import { useState } from "react";
import Link from "next/link";
import { Clapperboard, Plus } from "lucide-react";
import {
  EmptyState,
  LibraryPage,
  primaryButton,
} from "@/features/ads-studio/components/library/LibraryPage";
import { useMyClips } from "../hooks/use-clipping";
import { ClippingPlatformId, PLATFORM_BY_ID } from "../platforms";
import {
  CLIP_GRID_CLASS,
  ClipTileSkeleton,
  ClipTiles,
  RunningClipTile,
} from "./ClipTiles";

const PAGE_SIZE = 24;

/** Every clip the user made, or only the ones made for one platform. */
export function MyClips({ platform }: { platform?: ClippingPlatformId }) {
  const { clips, running, isLoading, isError, error, refetch } =
    useMyClips(platform);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const info = platform ? PLATFORM_BY_ID[platform] : null;

  const newButton = (
    <Link href="/clipping-studio" className={primaryButton}>
      <Plus className="size-4" />
      Create clips
    </Link>
  );

  return (
    <LibraryPage
      title={info ? `${info.label} clips` : "All clips"}
      description={
        info
          ? `Clips made for ${info.label}. A clip made for several platforms shows under each of them.`
          : "Every clip you've made, newest first."
      }
      action={newButton}
    >
      {isLoading ? (
        <div className={CLIP_GRID_CLASS}>
          {Array.from({ length: 10 }, (_, i) => (
            <ClipTileSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<Clapperboard className="size-5" />}
          title="Couldn't load your clips"
          text={error instanceof Error ? error.message : "Please try again."}
          action={
            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm text-white/70 underline hover:text-white"
            >
              Try again
            </button>
          }
        />
      ) : (
        <>
          {running.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-white/70">
                In progress
              </h2>
              <div className={CLIP_GRID_CLASS}>
                {running.map((project) => (
                  <RunningClipTile key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}

          {clips.length === 0 ? (
            !running.length && (
              <EmptyState
                icon={<Clapperboard className="size-5" />}
                title={info ? `No ${info.label} clips yet` : "No clips yet"}
                text={
                  info
                    ? `Pick ${info.label} when you create clips and they'll show up here.`
                    : "Paste a link or upload a video to get your first clips."
                }
                action={newButton}
              />
            )
          ) : (
            <>
              <ClipTiles items={clips.slice(0, visible)} platform={platform} />
              {visible < clips.length && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-white/50">
                    Showing {visible} of {clips.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Show more
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </LibraryPage>
  );
}
