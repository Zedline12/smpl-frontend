"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Clapperboard, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ArtistMode = "song" | "clip";

/** The Artist page's mode, from `?tab=clip` (recreate links use it too). */
export function useArtistMode(): [ArtistMode, (mode: ArtistMode) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode: ArtistMode = searchParams.get("tab") === "clip" ? "clip" : "song";
  const setMode = (next: ArtistMode) => {
    if (next === mode) return;
    const params = new URLSearchParams(searchParams.toString());
    if (next === "clip") params.set("tab", "clip");
    else params.delete("tab");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  return [mode, setMode];
}

export type ArtistSection = "home" | "songs" | "clips";

/** The Artist page's sidebar section, from `?view=` (anything else is Home). */
export function useArtistSection(): [ArtistSection, (section: ArtistSection) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get("view");
  const section: ArtistSection = raw === "songs" || raw === "clips" ? raw : "home";
  const setSection = (next: ArtistSection) => {
    if (next === section) return;
    const params = new URLSearchParams(searchParams.toString());
    if (next === "home") params.delete("view");
    else params.set("view", next);
    const query = params.toString();
    // push: the back button returns to the previous section.
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  return [section, setSection];
}

const MODES = [
  { id: "song", label: "Create a song", icon: Music2 },
  { id: "clip", label: "Make a video clip", icon: Clapperboard },
] as const;

/** "Create a song" / "Make a video clip": swaps the DJ for the clip inputs. */
export function ArtistModeSwitch({ compact, className }: { compact?: boolean; className?: string }) {
  const [mode, setMode] = useArtistMode();
  return (
    <div
      role="tablist"
      aria-label="What to make"
      className={cn(
        "flex gap-1 rounded-full border border-white/[0.08] bg-black/40 p-1",
        compact && "w-full",
        className,
      )}
    >
      {MODES.map(({ id, label, icon: Icon }) => {
        const on = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => setMode(id)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full font-semibold whitespace-nowrap transition-all",
              compact ? "h-8 flex-1 px-2 text-xs" : "h-9 px-4 text-sm",
              on ? "text-white shadow-[0_0_18px_-8px_var(--color-primary)]" : "text-white/60 hover:text-white",
            )}
            style={
              on
                ? { background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))" }
                : undefined
            }
          >
            <Icon className={compact ? "size-3.5" : "size-4"} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
