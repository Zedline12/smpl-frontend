"use client";

import Link from "next/link";

const STUDIOS: { label: string; href: string; isNew?: boolean }[] = [
  { label: "Clipping Studio", href: "/clipping-studio", isNew: true },
  { label: "Marketing Studio", href: "/marketing-studio", isNew: true },
];

export function StudioLinks() {
  return (
    <div className="hidden md:flex md:items-center md:gap-1">
      {STUDIOS.map((studio) => (
        <Link
          key={studio.href}
          href={studio.href}
          className="text-foreground/75 hover:text-foreground flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors"
        >
          {studio.label}
          {studio.isNew && (
            <span className="bg-secondary/15 text-secondary rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
              New
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
