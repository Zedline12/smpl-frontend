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
      {/* Glowy blue page light */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-56 left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-blue-500 opacity-25 blur-[140px]" />
        <div className="absolute top-1/3 -left-48 size-[30rem] rounded-full bg-cyan-400 opacity-[0.12] blur-[140px]" />
        <div className="absolute -right-48 bottom-0 size-[32rem] rounded-full bg-indigo-500 opacity-[0.12] blur-[140px]" />
      </div>

      <div className="relative mx-auto flex w-[90%] max-w-[1600px] flex-col gap-10 pt-3 pb-12">
        {/* Hero: create section */}
        <section className="relative flex min-h-[58vh] items-center justify-center overflow-hidden rounded-3xl border border-blue-400/15 shadow-[0_0_80px_-30px_rgba(59,130,246,0.7)]">
          <ClippingHeroBackground />
          {/* Darken the scene, most of all behind the form */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 60% at 50% 50%, rgba(2,6,23,0.92), rgba(2,6,23,0.72) 60%, rgba(2,6,23,0.55))",
            }}
          />

          <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-3 px-4 py-12 sm:py-16">
            <h1
              className="text-center text-4xl font-black tracking-tight text-white uppercase sm:text-6xl"
              style={{
                fontFamily: "var(--font-display)",
                textShadow: "0 0 24px rgba(59,130,246,0.85), 0 0 60px rgba(56,189,248,0.45)",
              }}
            >
              Clipping Studio
            </h1>
            <p className="mb-3 text-center text-sm text-blue-100/70">
              Turn one long video into scroll-stopping clips for every feed.
            </p>
            <CreateClippingForm
              className="w-full border-white/10 bg-slate-950/55 shadow-[0_0_60px_-15px_rgba(59,130,246,0.8)] backdrop-blur-xl"
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
          className="relative flex scroll-mt-4 flex-col gap-5 overflow-hidden rounded-3xl border border-blue-400/15 bg-slate-950/40 p-4 shadow-[0_0_80px_-40px_rgba(59,130,246,0.8)] backdrop-blur-xl sm:p-6"
        >
          {/* Sprocket edge along the top, like a strip of film */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-2 opacity-40"
            style={{
              background:
                "repeating-linear-gradient(90deg, rgba(147,197,253,0.5) 0 10px, transparent 10px 22px)",
            }}
          />
          <div className="flex items-end justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-500/15 shadow-[0_0_24px_-6px_rgba(59,130,246,0.9)]">
                <Film className="size-5 text-blue-200" />
              </span>
              <div>
                <h2
                  className="text-2xl font-black tracking-tight text-white uppercase"
                  style={{
                    fontFamily: "var(--font-display)",
                    textShadow: "0 0 18px rgba(59,130,246,0.7)",
                  }}
                >
                  Your clips
                </h2>
                <p className="text-sm text-blue-100/55">
                  Everything you&apos;ve clipped, and anything still processing.
                </p>
              </div>
            </div>
          </div>
          <ClippingProjectsGrid
            emptyAction={
              <p className="text-muted-foreground mt-1 text-sm">
                Paste a link above to get your first clips.
              </p>
            }
          />
        </section>
      </div>
    </div>
  );
}
