"use client";
import { useEffect, useState } from "react";
import { FileText, ScanLine, Wand2 } from "lucide-react";

const chip =
  "flex flex-col items-center gap-0.5 rounded-xl border border-white/10 bg-[#16161b] px-2 py-1.5 text-[9px] font-semibold tracking-wider text-white/70 uppercase shadow-lg";

/**
 * The top of Video Analyzer Home: a framed card playing the user's latest analyzed
 * video (muted, looping), small labels around it, and the two-line headline.
 */
export function AnalyzerHero({ videoUrl }: { videoUrl?: string }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  return (
    <section className="flex w-full flex-col items-center gap-5 pt-6">
      <div className="relative w-full max-w-[26rem] px-12 sm:px-14">
        <div className="absolute top-3 left-0 flex flex-col items-center gap-3">
          <span className={chip}>
            <Wand2 className="text-primary size-3.5" />
            Remake
          </span>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-gradient-to-b from-[#26262e] to-[#121216] p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95)]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-black">
            {videoUrl ? (
              <video
                key={videoUrl}
                src={reduceMotion ? `${videoUrl}#t=0.5` : videoUrl}
                muted
                loop
                playsInline
                autoPlay={!reduceMotion}
                preload="metadata"
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <div
                className="flex size-full items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-primary) 55%, transparent), transparent 60%), radial-gradient(circle at 80% 90%, color-mix(in srgb, var(--color-secondary) 45%, transparent), transparent 55%), #0d0d11",
                }}
              >
                <ScanLine className="size-14 text-white/80" strokeWidth={1.5} />
              </div>
            )}
            <span className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-white/10 ring-inset" />
          </div>
        </div>

        <div className="absolute top-3 right-0 flex flex-col items-center gap-3">
          <span className={chip}>
            <FileText className="text-primary size-3.5" />
            Script
          </span>
        </div>
      </div>

      <h1
        className="flex flex-col items-center gap-1.5 text-center text-xl leading-none font-black tracking-tight uppercase sm:text-2xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <span className="bg-primary rounded-sm px-2 py-1 text-white">
          Drop a video
        </span>
        <span className="text-white">We break it down</span>
      </h1>
    </section>
  );
}
