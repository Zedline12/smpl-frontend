"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/clipping-studio",
    label: "Create",
    icon: Scissors,
    /** Exact, or "Create" would stay active on every sub-route. */
    exact: true,
  },
  {
    href: "/clipping-studio/your-clips",
    label: "Your Clips",
    icon: Film,
    // Prefix match so it stays active on a project's detail page.
    exact: false,
  },
];

export function ClippingStudioNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 md:flex-col">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-l-primary bg-primary/15 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent border-l-transparent",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
