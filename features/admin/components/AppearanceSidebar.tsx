"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, LayoutTemplate, ChevronLeft } from "lucide-react";

const links = [
  { icon: BookOpen, label: "How It Works", href: "/admin/appearance/how-it-works" },
  { icon: LayoutTemplate, label: "Templates", href: "/admin/appearance/templates" },
  { icon: Home, label: "Homepage Sections", href: "/admin/appearance/homepage" },
];

export const AppearanceSidebar = () => {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16 overflow-y-auto"
      style={{ background: "#0c0c0c", borderRight: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Back + header */}
      <div className="px-5 pt-5 pb-3">
        <Link
          href="/admin/users"
          className="flex items-center gap-1.5 text-[12px] mb-4 transition-colors"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Admin
        </Link>
        <div
          className="text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "rgba(255,255,255,0.22)" }}
        >
          App Appearance
        </div>
      </div>

      <nav className="flex-1 px-3 pb-4">
        <div className="space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-150 relative"
                style={
                  isActive
                    ? { background: "rgba(234,75,255,0.12)", color: "#f5a8ff" }
                    : { color: "rgba(255,255,255,0.48)" }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "";
                    e.currentTarget.style.color = "rgba(255,255,255,0.48)";
                  }
                }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: "#ea4bff" }}
                  />
                )}
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isActive ? "#ea4bff" : "rgba(255,255,255,0.35)" }}
                />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div
          className="rounded-xl p-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(234,75,255,0.1) 0%, rgba(107,65,255,0.08) 100%)",
            border: "1px solid rgba(234,75,255,0.18)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#ea4bff", boxShadow: "0 0 6px rgba(234,75,255,0.7)" }}
            />
            <span className="text-[12px] font-semibold text-white">Appearance</span>
          </div>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Manage content & visuals
          </p>
        </div>
      </div>
    </aside>
  );
};
