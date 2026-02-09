"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  FileText,
  BarChart3,
} from "lucide-react";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: CreditCard, label: "Subscriptions", href: "/admin/subscriptions" },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0A0A0A] hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16">
      <div className="p-4 space-y-2">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto p-4 border-t border-white/10">
        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-500/10">
          <h4 className="text-white text-sm font-semibold mb-1">Pro Status</h4>
          <p className="text-xs text-gray-400 mb-3">
            Your admin access is active.
          </p>
        </div>
      </div>
    </aside>
  );
};
