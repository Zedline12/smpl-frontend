"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Film } from "lucide-react";
import { useCreateClippingProjectMutation } from "../hooks/use-clipping";
import { ClippingHeroBackground } from "./ClippingHeroBackground";
import { ClippingProjectsGrid } from "./ClippingProjectsGrid";
import { CreateClippingForm } from "./CreateClippingForm";

/** Clipping Studio: a hero with the create form on top, the user's clips below. */
export function ClippingStudioHome() {
  const createProject = useCreateClippingProjectMutation();
  const clipsRef = useRef<HTMLElement>(null);

  return (
    <div className="relative min-h-full">
      <div className="relative mx-auto flex w-[90%] max-w-[1600px] flex-col gap-10 pt-3 pb-12">
        {/* Hero: create section */}
        <section className="relative flex min-h-[58vh] items-center justify-center overflow-hidden">
          <ClippingHeroBackground />

          <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-3 px-4 py-12 sm:py-16">
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
                  onSuccess: () => {
                    toast.success("Clipping started");
                    clipsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  },
                })
              }
            />
          </div>
        </section>

        {/* Explorer: the user's clips */}
        <section
          ref={clipsRef}
          className="relative flex scroll-mt-4 flex-col gap-5 overflow-hidden rounded-3xl border border-white/15 bg-neutral-950/40 p-4 shadow-[0_0_80px_-40px_rgba(255,255,255,0.44)] backdrop-blur-xl sm:p-6"
        >
          {/* Sprocket edge along the top, like a strip of film */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-2 opacity-40"
            style={{
              background:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0 10px, transparent 10px 22px)",
            }}
          />
          <div className="flex items-end justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-white/30 bg-white/15 shadow-[0_0_24px_-6px_rgba(255,255,255,0.5)]">
                <Film className="size-5 text-white/80" />
              </span>
              <div>
                <h2
                  className="text-2xl font-black tracking-tight text-white uppercase"
                  style={{
                    fontFamily: "var(--font-display)",
                    textShadow: "0 0 18px rgba(255,255,255,0.39)",
                  }}
                >
                  Your clips
                </h2>
                <p className="text-sm text-white/55">
                  Everything you&apos;ve clipped, and anything still processing.
                </p>
              </div>
            </div>
          </div>
          <ClippingProjectsGrid
            emptyAction={
              <p className="text-white/60 mt-1 text-sm">
                Paste a link above to get your first clips.
              </p>
            }
          />
        </section>
      </div>
    </div>
  );
}
