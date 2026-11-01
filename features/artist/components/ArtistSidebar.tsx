"use client";
import ArtistBuilder from "./ArtistBuilder";
import VideoClipBuilder from "./VideoClipBuilder";

export type ArtistTab = "song" | "clip";

const TABS: { value: ArtistTab; label: string }[] = [
  { value: "song", label: "Create song" },
  { value: "clip", label: "Create video clip" },
];

/** Artist sidebar: Create song / Create video clip tabs, styled like /create's video tabs. */
export default function ArtistSidebar({
  tab,
  onTabChange,
}: {
  tab: ArtistTab;
  onTabChange: (tab: ArtistTab) => void;
}) {
  return (
    <aside className="flex h-full flex-col overflow-hidden border-r border-border bg-white/[0.025]">
      <div className="flex w-full flex-shrink-0 border-b border-border">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onTabChange(value)}
            className={`flex-1 border-b-2 py-3 text-xs font-semibold transition-colors ${
              tab === value
                ? "border-white text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Both stay mounted so switching tabs keeps what the user picked. */}
      <div className={tab === "song" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
        <ArtistBuilder />
      </div>
      <div className={tab === "clip" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
        <VideoClipBuilder />
      </div>
    </aside>
  );
}
