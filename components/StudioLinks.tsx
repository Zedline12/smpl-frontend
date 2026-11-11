"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";

const STUDIOS: { label: string; href: string; isNew?: boolean }[] = [
  { label: "Mcp Integration", href: "/me/settings/mcp", isNew: true },
  { label: "Clipping Studio", href: "/clipping-studio", isNew: true },
  { label: "AI Influencer Studio", href: "/ai-influencer-studio", isNew: true },
  { label: "Ads Studio", href: "/create/image?model=higgsfield-ads-studio", isNew: true },
  { label: "Artist", href: "/artist", isNew: true },
  { label: "Remix", href: "/remix", isNew: true },
  //{ label: "Marketing Studio", href: "/marketing-studio", isNew: true },
  // { label: "Video Analyzer", href: "/video-analyzer", isNew: true },
];

export function StudioLinks() {
  const pathname = usePathname();
  const model = useAiGenerationControlStore((s) => s.model);

  const isCurrent = (href: string) => {
    const [path, query] = href.split("?");
    if (query) {
      const linked = new URLSearchParams(query).get("model");
      return pathname.startsWith(path) && model === linked;
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
      {STUDIOS.map((studio) => {
        const current = isCurrent(studio.href);
        return (
          <Link
            key={studio.href}
            href={studio.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors sm:px-2.5 sm:text-sm",
              current ? "text-primary" : "text-foreground/55 hover:text-foreground",
            )}
          >
            {studio.label}
            {studio.isNew && (
              <span className="bg-secondary/15 text-secondary rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                New
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
