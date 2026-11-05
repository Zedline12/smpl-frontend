"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  LucideIcon,
  Palette,
  Plug,
  Share2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconSquare } from "./SettingsUi";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Background of the icon square. */
  color: string;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Account",
    items: [
      { href: "/me/settings/account", label: "Profile", icon: User, color: "#3b82f6" },
      { href: "/me/settings/appearance", label: "Appearance", icon: Palette, color: "#8b5cf6" },
    ],
  },
  {
    title: "Billing",
    items: [
      { href: "/me/settings/subscription", label: "Subscription", icon: CreditCard, color: "#22c55e" },
      { href: "/me/settings/usage", label: "Usage", icon: BarChart3, color: "#ef4444" },
      { href: "/me/settings/referrals", label: "Referrals", icon: Share2, color: "#f59e0b" },
    ],
  },
  {
    title: "Integrations",
    items: [{ href: "/me/settings/mcp", label: "MCP", icon: Plug, color: "#06b6d4" }],
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-4 md:flex-col md:gap-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <p className="text-muted-foreground mb-1 hidden px-2 text-[11px] font-semibold tracking-widest uppercase md:block">
            {group.title}
          </p>

          <div className="flex flex-row gap-1 md:flex-col md:gap-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-150",
                    active
                      ? "bg-white/[0.06] text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                  )}
                >
                  <IconSquare icon={item.icon} color={item.color} />
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
