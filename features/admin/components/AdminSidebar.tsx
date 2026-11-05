"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  CreditCard,
  BarChart3,
  Image,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  Paintbrush,
  Zap,
  Brain,
  LifeBuoy,
  Bell,
} from "lucide-react";
import { AppearanceSidebar } from "./AppearanceSidebar";

const SECTIONS = [
  {
    label: "Management",
    links: [
      { icon: Brain, label: "Smpl Brain", href: "/admin/brain" },
      { icon: Users, label: "Users", href: "/admin/users" },
      { icon: ShieldAlert, label: "Security", href: "/admin/security" },
      { icon: Bell, label: "Notifications", href: "/admin/notifications" },
      { icon: Image, label: "Media", href: "/admin/media" },
      { icon: BarChart3, label: "Generations", href: "/admin/generations" },
      { icon: CreditCard, label: "Subscriptions", href: "/admin/subscriptions" },
      { icon: LifeBuoy, label: "Support", href: "/admin/support" },
    ],
  },
  {
    label: "Billing & Monetization",
    links: [
      { icon: CreditCard, label: "Subscription Plans", href: "/admin/subscription-plans" },
      { icon: Zap, label: "Credit Pricing", href: "/admin/credit-pricing" },
      { icon: DollarSign, label: "Model Costs", href: "/admin/model-costs" },
      { icon: TrendingUp, label: "Profit", href: "/admin/profit" },
    ],
  },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/admin/appearance")) {
    return <AppearanceSidebar />;
  }

  const isAppearance = pathname.startsWith("/admin/appearance");

  return (
    <aside
      className="w-64 hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16 overflow-y-auto"
      style={{ background: "#0c0c0c", borderRight: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Logo mark */}
      <div className="px-5 pt-5 pb-3">
        <div
          className="text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Admin
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 pb-4 space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <p
              className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-150 group relative"
                    style={
                      isActive
                        ? {
                            background: "rgba(107,65,255,0.14)",
                            color: "#b89dff",
                          }
                        : {
                            color: "rgba(255,255,255,0.48)",
                          }
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
                        style={{ background: "var(--purple-500)" }}
                      />
                    )}
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: isActive ? "#9370ff" : "rgba(255,255,255,0.35)" }}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* App Appearance */}
        <div>
          <p
            className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            Content
          </p>
          <Link
            href="/admin/appearance/how-it-works"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-150"
            style={
              isAppearance
                ? { background: "rgba(234,75,255,0.12)", color: "#f5a8ff" }
                : { color: "rgba(255,255,255,0.48)" }
            }
            onMouseEnter={(e) => {
              if (!isAppearance) {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(255,255,255,0.9)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isAppearance) {
                e.currentTarget.style.background = "";
                e.currentTarget.style.color = "rgba(255,255,255,0.48)";
              }
            }}
          >
            <Paintbrush
              className="w-4 h-4 flex-shrink-0"
              style={{ color: isAppearance ? "#ea4bff" : "rgba(255,255,255,0.35)" }}
            />
            App Appearance
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div
          className="rounded-xl p-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(107,65,255,0.12) 0%, rgba(234,75,255,0.08) 100%)",
            border: "1px solid rgba(107,65,255,0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
            />
            <span className="text-[12px] font-semibold text-white">Admin Active</span>
          </div>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Full access to all controls
          </p>
        </div>
      </div>
    </aside>
  );
};
