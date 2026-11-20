"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Clapperboard } from "lucide-react";
import { EmptyState } from "@/features/ads-studio/components/library/LibraryPage";
import {
  useCreateClippingProjectMutation,
  useMyClips,
} from "../hooks/use-clipping";
import { ClippingHeroBackground } from "./ClippingHeroBackground";
import {
  CLIP_GRID_CLASS,
  ClipTileSkeleton,
  ClipTiles,
  RunningClipTile,
} from "./ClipTiles";
import { CreateClippingForm } from "./CreateClippingForm";

const RECENT = 5;

/** Clipping Studio home: the create form over the phones, then the latest clips. */
export function ClippingStudioHome() {
  const router = useRouter();
  const createProject = useCreateClippingProjectMutation();
  const { clips, running, isLoading } = useMyClips();

  // Running projects first, then the newest clips, five tiles in all.
  const shownRunning = running.slice(0, RECENT);
  const shownClips = clips.slice(0, RECENT - shownRunning.length);
  const empty = !isLoading && !shownRunning.length && !shownClips.length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-4 pb-12 sm:px-6">
      <section className="relative flex min-h-[54vh] items-center justify-center overflow-hidden rounded-2xl">
        <ClippingHeroBackground />

        <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-3 py-10 sm:py-14">
          <h1
            className="text-center text-4xl font-black tracking-tight text-white uppercase sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Clipping Studio
          </h1>
          <p className="mb-3 text-center text-sm text-white/70">
            Turn one long video into scroll-stopping clips for every feed.
          </p>
          <CreateClippingForm
            className="w-full border-white/10 bg-neutral-950/80 backdrop-blur-xl"
            isSubmitting={createProject.isPending}
            onSubmit={(values) =>
              createProject.mutate(values, {
                onSuccess: (project) =>
                  toast.success("Clipping started", {
                    action: {
                      label: "View",
                      onClick: () =>
                        router.push(`/clipping-studio/${project.id}`),
                    },
                  }),
              })
            }
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Recent clips</h2>
          {!empty && (
            <Link
              href="/clipping-studio/clips"
              className="flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
            >
              See all
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className={CLIP_GRID_CLASS}>
            {Array.from({ length: RECENT }, (_, i) => (
              <ClipTileSkeleton key={i} />
            ))}
          </div>
        ) : empty ? (
          <EmptyState
            icon={<Clapperboard className="size-5" />}
            title="No clips yet"
            text="Paste a link or upload a video above to get your first clips."
          />
        ) : (
          <div className={CLIP_GRID_CLASS}>
            {shownRunning.map((project) => (
              <RunningClipTile key={project.id} project={project} />
            ))}
            {shownClips.length > 0 && (
              <ClipTiles items={shownClips} className="contents" />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
