"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  ADMIN_SECTIONS,
  SETTINGS_SECTIONS,
  isActiveLink,
  isSettingsPath,
  type AdminNavSection,
} from "./admin-nav";

/** Owner/dev-only links (Updates). */
function useCanSeeUpdates() {
  const { data } = useQuery({
    queryKey: ["admin-releases-access"],
    queryFn: async () => {
      const res = await fetch("/api/admin/releases/access");
      return res.ok ? ((await res.json()) as { owner: boolean; dev: boolean }) : null;
    },
    staleTime: 5 * 60_000,
  });
  return !!(data?.owner || data?.dev);
}

/**
 * The menu for this page: App Settings pages get the settings menu (with a way back),
 * everything else the main admin menu. Shared by the desktop sidebar and the phone drawer.
 */
export function AdminNavMenu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const canSeeUpdates = useCanSeeUpdates();
  const settings = isSettingsPath(pathname);
  const sections: AdminNavSection[] = settings ? SETTINGS_SECTIONS : ADMIN_SECTIONS;
  const accent = settings
    ? { bg: "rgba(234,75,255,0.12)", text: "#f5a8ff", icon: "#ea4bff", bar: "#ea4bff" }
    : { bg: "rgba(107,65,255,0.14)", text: "#b89dff", icon: "#9370ff", bar: "var(--purple-500)" };

  return (
    <>
      <div className="px-5 pt-5 pb-3">
        {settings && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className="mb-4 flex items-center gap-1.5 text-[12px] text-white/35 transition-colors hover:text-white/80"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Admin
          </Link>
        )}
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/25">
          {settings ? "App Settings" : "Admin"}
        </div>
      </div>

      <nav className="flex-1 space-y-6 px-3 pb-4">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/[0.22]">{section.label}</p>
            <div className="space-y-0.5">
              {section.links
                .filter((link) => !link.ownerOrDev || canSeeUpdates)
                .map((link) => {
                  const Icon = link.icon;
                  // "App Settings" lights up on every settings page.
                  const active =
                    link.label === "App Settings" ? settings : isActiveLink(pathname, link.href);
                  return (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      onClick={onNavigate}
                      className={cn(
                        "relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                        !active && "text-white/[0.48] hover:bg-white/5 hover:text-white/90",
                      )}
                      style={active ? { background: accent.bg, color: accent.text } : undefined}
                    >
                      {active && (
                        <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full" style={{ background: accent.bar }} />
                      )}
                      <Icon className="h-4 w-4 flex-shrink-0" style={{ color: active ? accent.icon : "rgba(255,255,255,0.35)" }} />
                      {link.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}

/** Desktop / tablet sidebar (phones use the drawer in the navbar: AdminMobileNav). */
export const AdminSidebar = () => (
  <aside
    className="sticky top-16 hidden h-[calc(100vh-64px)] w-64 shrink-0 flex-col overflow-y-auto md:flex"
    style={{ background: "#0c0c0c", borderRight: "1px solid rgba(255,255,255,0.07)" }}
  >
    <AdminNavMenu />
    <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div
        className="rounded-xl p-4"
        style={{
          background: "linear-gradient(135deg, rgba(107,65,255,0.12) 0%, rgba(234,75,255,0.08) 100%)",
          border: "1px solid rgba(107,65,255,0.2)",
        }}
      >
        <div className="mb-1 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
          <span className="text-[12px] font-semibold text-white">Admin Active</span>
        </div>
        <p className="text-[11px] text-white/40">Full access to all controls</p>
      </div>
    </div>
  </aside>
);
