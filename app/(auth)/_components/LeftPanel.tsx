"use client";

import { useEffect, useRef, useState } from "react";

const LINE1 = "Create anything.";
const LINE2 = "In seconds.";
const FULL = LINE1 + "\n" + LINE2;


export function LeftPanel() {
  const [displayText, setDisplayText] = useState("");
  const posRef = useRef(0);
  const deletingRef = useRef(false);
  const pauseRef = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      if (!deletingRef.current) {
        if (posRef.current < FULL.length) {
          posRef.current++;
          setDisplayText(FULL.slice(0, posRef.current));
          timeout = setTimeout(tick, 48 + (Math.random() * 30 - 10));
        } else {
          if (pauseRef.current < 52) {
            pauseRef.current++;
            timeout = setTimeout(tick, 60);
          } else {
            pauseRef.current = 0;
            deletingRef.current = true;
            timeout = setTimeout(tick, 28);
          }
        }
      } else {
        if (posRef.current > 0) {
          posRef.current--;
          setDisplayText(FULL.slice(0, posRef.current));
          timeout = setTimeout(tick, 28 + (Math.random() * 15));
        } else {
          if (pauseRef.current < 18) {
            pauseRef.current++;
            timeout = setTimeout(tick, 60);
          } else {
            pauseRef.current = 0;
            deletingRef.current = false;
            timeout = setTimeout(tick, 48);
          }
        }
      }
    }

    timeout = setTimeout(tick, 800);
    return () => clearTimeout(timeout);
  }, []);

  const parts = displayText.split("\n");

  return (
    <div
      className="relative flex-[1.1] overflow-hidden flex flex-col justify-end p-12"
      style={{ animation: "fadeUp 0.8s ease-out forwards" }}
    >
      {/* Blobs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 520, height: 520,
          background: "radial-gradient(circle, rgba(107,65,255,0.35) 0%, transparent 70%)",
          top: -120, left: -80,
          filter: "blur(80px)",
          animation: "blobDrift1 14s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(234,75,255,0.28) 0%, transparent 70%)",
          bottom: 60, right: -60,
          filter: "blur(80px)",
          animation: "blobDrift2 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280, height: 280,
          background: "radial-gradient(circle, rgba(107,65,255,0.18) 0%, transparent 70%)",
          top: "45%", left: "35%",
          filter: "blur(80px)",
          animation: "blobDrift3 22s ease-in-out infinite",
        }}
      />

      {/* Bottom copy */}
      <div className="relative z-10">
        <h2
          className="text-white mb-3.5"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 42,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
          }}
        >
          {parts[0] ?? ""}
          {parts.length > 1 && (
            <>
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #9370ff, #ef75ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {parts[1]}
              </span>
            </>
          )}
          <span
            className="ml-0.5 font-light"
            style={{
              color: "#9370ff",
              animation: "blink 0.9s step-end infinite",
            }}
          >
            |
          </span>
        </h2>

        <p className="text-sm text-white/45 leading-relaxed max-w-[360px]">
          SMPL gives you access to the world&apos;s most powerful AI models for images,
          video, and audio — all in one place.
        </p>

        {/* Stats */}
        <div className="flex items-center gap-5 mt-7 pt-[22px] border-t border-white/[0.07]">
          {[
            { val: "10,000+", lbl: "Assets generated" },
            { val: "7",    lbl: "AI models" },
            { val: "10k+", lbl: "Creators" },
          ].map((stat, i, arr) => (
            <div key={stat.lbl} className="flex items-center gap-5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[18px] font-bold text-white tracking-[-0.02em]">{stat.val}</span>
                <span className="text-[11px] text-white/35 tracking-[0.02em]">{stat.lbl}</span>
              </div>
              {i < arr.length - 1 && <div className="w-px h-8 bg-white/[0.08]" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
