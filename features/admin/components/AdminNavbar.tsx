"use client";

import React from "react";
import { Search } from "lucide-react";
import { NotificationBell } from "@/features/admin/notifications/components/NotificationBell";

export const AdminNavbar = () => {
  return (
    <nav
      className="h-16 flex items-center justify-between px-6 sticky top-0 z-50"
      style={{
        background: "rgba(12,12,12,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Left: brand */}
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span
          className="text-[15px] font-bold tracking-tight"
          style={{
            background: "linear-gradient(90deg, #9370ff, #ea4bff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          smpl admin
        </span>
      </div>

      {/* Right: search + actions */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: "rgba(255,255,255,0.3)" }}
          />
          <input
            type="text"
            placeholder="Search…"
            className="rounded-[10px] pl-9 pr-4 py-1.5 text-[13px] focus:outline-none transition-colors w-56"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.8)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(107,65,255,0.5)";
              e.currentTarget.style.background = "rgba(107,65,255,0.06)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
          />
        </div>

        <NotificationBell />

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)",
          }}
        >
          A
        </div>
      </div>
    </nav>
  );
};
