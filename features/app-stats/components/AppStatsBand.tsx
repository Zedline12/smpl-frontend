"use client";

import { AppStats } from "../types";
import { StatCounter } from "./StatCounter";

const TILES: { key: keyof AppStats; label: string }[] = [
  { key: "totalUsers", label: "Creators" },
  { key: "totalGenerations", label: "Generations" },
  { key: "totalCreditsSpent", label: "Credits Spent" },
];

export function AppStatsBand({ stats }: { stats: AppStats }) {
  return (
    <section
      aria-label="Platform statistics"
      className="animate-fade-in-up border-border mx-auto mb-4 w-full max-w-5xl rounded-2xl border px-4 py-3 sm:px-8 sm:py-4"
      // A brighter take on --gradient-card, which is very faint by design.
      style={{
        background:
          "linear-gradient(160deg, rgba(107, 65, 255, 0.18) 0%, rgba(234, 75, 255, 0.12) 100%)",
      }}
    >
      <div className="grid grid-cols-3 items-center">
        {TILES.map((tile, index) => (
          <div key={tile.key} className="relative flex justify-center">
            <div
              className="animate-fade-in-up flex flex-col items-center gap-0.5 text-center opacity-0"
              style={{
                animationDelay: `${index * 120}ms`,
                animationFillMode: "forwards",
              }}
            >
              <StatCounter value={stats[tile.key]} />
              <span className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase sm:text-xs">
                {tile.label}
              </span>
            </div>

            {index < TILES.length - 1 && (
              <span className="bg-border absolute top-1/2 right-0 hidden h-8 w-px -translate-y-1/2 sm:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
