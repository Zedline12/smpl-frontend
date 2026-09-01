"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LucideIcon,
  Palette,
  Share2,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Account",
    items: [
      { href: "/settings/account", label: "Profile", icon: User },
      { href: "/settings/appearance", label: "Appearance", icon: Palette },
    ],
  },
  {
    title: "Billing",
    items: [
      { href: "/settings/billing", label: "Plan & Billing", icon: CreditCard },
      {
        href: "/settings/credits-usage",
        label: "Credits Usage",
        icon: Sparkles,
      },
      { href: "/settings/referrals", label: "Referrals", icon: Share2 },
    ],
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-4 md:flex-col md:gap-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <p className="text-muted-foreground mb-1 hidden px-3 text-[11px] font-semibold tracking-widest uppercase md:block">
            {group.title}
          </p>

          <div className="flex flex-row gap-1 md:flex-col md:gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150",
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
          </div>
        </div>
      ))}
    </nav>
  );
}
