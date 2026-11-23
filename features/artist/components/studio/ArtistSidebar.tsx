"use client";
import { Clapperboard, Home, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ArtistSection, useArtistSection } from "./ArtistModeSwitch";

const ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "songs", label: "Your songs", icon: Music2 },
  { id: "clips", label: "Your clips", icon: Clapperboard },
] as const satisfies readonly { id: ArtistSection; label: string; icon: unknown }[];

const ACTIVE = { background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" };

/** Desktop: a slim full-height rail on the far left (icon over a short label). */
export function ArtistSidebar() {
  const [section, setSection] = useArtistSection();
  return (
    <nav
      aria-label="Artist"
      className="relative z-20 hidden h-full w-[84px] shrink-0 flex-col items-center gap-2 border-r border-white/[0.07] bg-black/30 px-2 py-4 backdrop-blur-xl md:flex"
    >
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const on = section === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            aria-current={on ? "page" : undefined}
            className="group flex w-full flex-col items-center gap-1 rounded-2xl py-1.5 text-[10px] font-semibold"
          >
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl transition-colors",
                on
                  ? "text-white shadow-[0_0_18px_-8px_var(--color-primary)]"
                  : "text-white/55 group-hover:bg-white/[0.07] group-hover:text-white",
              )}
              style={on ? ACTIVE : undefined}
            >
              <Icon className="size-5" />
            </span>
            <span className={cn("leading-tight", on ? "text-white" : "text-white/50 group-hover:text-white/80")}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/** Phones: the same sections as a tab row at the top (the bottom has the docks and player). */
export function ArtistSectionTabs() {
  const [section, setSection] = useArtistSection();
  return (
    <nav aria-label="Artist" className="flex gap-1 rounded-full border border-white/[0.08] bg-black/40 p-1 md:hidden">
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const on = section === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
              on ? "text-white" : "text-white/60",
            )}
            style={on ? ACTIVE : undefined}
          >
            <Icon className="size-4" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
