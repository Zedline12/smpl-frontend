"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Video", href: "/create/video" },
  { label: "Image", href: "/create/image" },
  { label: "Audio", href: "/create/audio" },
];

export function CreateTabNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 border-b border-border px-4 py-2 bg-background">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
