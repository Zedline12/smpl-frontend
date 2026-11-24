import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Boxes,
  Brain,
  CircleUserRound,
  CreditCard,
  Film,
  Flag,
  Gavel,
  Gift,
  Home,
  Image,
  LayoutDashboard,
  LayoutTemplate,
  LifeBuoy,
  LineChart,
  Megaphone,
  Package,
  Rocket,
  RotateCcw,
  Scale,
  Settings,
  ShieldAlert,
  Tag,
  Timer,
  TrendingUp,
  Users,
  WandSparkles,
  Zap,
  Bell,
} from "lucide-react";

export interface AdminNavLink {
  icon: LucideIcon;
  label: string;
  href: string;
  /** Shown only to the owner and devs (OWNER_EMAILS / DEV_EMAILS on the server). */
  ownerOrDev?: boolean;
}
export interface AdminNavSection {
  label: string;
  links: AdminNavLink[];
}

/** The main admin menu. */
export const ADMIN_SECTIONS: AdminNavSection[] = [
  {
    label: "Management",
    links: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
      { icon: Brain, label: "Smpl Brain", href: "/admin/brain" },
      { icon: Users, label: "Users", href: "/admin/users" },
      { icon: ShieldAlert, label: "Security", href: "/admin/security" },
      { icon: Bell, label: "Notifications", href: "/admin/notifications" },
      { icon: Megaphone, label: "Announcements", href: "/admin/broadcasts" },
      { icon: Flag, label: "Reports", href: "/admin/reports" },
      { icon: Image, label: "Media", href: "/admin/media" },
      { icon: BarChart3, label: "Generations", href: "/admin/generations" },
      { icon: CreditCard, label: "Subscriptions", href: "/admin/subscriptions" },
      { icon: LifeBuoy, label: "Support", href: "/admin/support" },
    ],
  },
  {
    label: "Billing & Monetization",
    links: [
      { icon: LineChart, label: "Analytics", href: "/admin/billing/analytics" },
      { icon: TrendingUp, label: "Profit", href: "/admin/profit" },
      { icon: Tag, label: "Discounts", href: "/admin/discounts" },
      { icon: Gift, label: "Gifts", href: "/admin/gifts" },
      { icon: RotateCcw, label: "Refunds", href: "/admin/billing/refunds" },
      { icon: Gavel, label: "Disputes", href: "/admin/billing/disputes" },
      { icon: Timer, label: "Generation Times", href: "/admin/generation-times" },
    ],
  },
  {
    label: "Configure",
    links: [{ icon: Settings, label: "App Settings", href: "/admin/catalog" }],
  },
];

/** App Settings: everything that configures the app (content, prices, plans, legal). */
export const SETTINGS_SECTIONS: AdminNavSection[] = [
  {
    label: "Content",
    links: [
      { icon: Boxes, label: "Catalog", href: "/admin/catalog" },
      { icon: Home, label: "Homepage Sections", href: "/admin/appearance/homepage" },
      { icon: LayoutTemplate, label: "Templates", href: "/admin/appearance/templates" },
      { icon: WandSparkles, label: "Styles", href: "/admin/appearance/styles" },
      { icon: CircleUserRound, label: "Avatars", href: "/admin/appearance/avatars" },
      { icon: Film, label: "Model Thumbnails", href: "/admin/appearance/thumbnails" },
      { icon: BookOpen, label: "How It Works", href: "/admin/appearance/how-it-works" },
    ],
  },
  {
    label: "Business",
    links: [
      { icon: Zap, label: "Pricing", href: "/admin/credit-pricing" },
      { icon: CreditCard, label: "Subscription Plans", href: "/admin/subscription-plans" },
      { icon: Package, label: "Credit Packs", href: "/admin/credit-packs" },
    ],
  },
  {
    label: "Site",
    links: [
      { icon: Scale, label: "Legal", href: "/admin/legal" },
      { icon: Rocket, label: "Updates", href: "/admin/updates", ownerOrDev: true },
    ],
  },
];

const SETTINGS_PREFIXES = [
  "/admin/appearance",
  "/admin/catalog",
  "/admin/credit-pricing",
  "/admin/subscription-plans",
  "/admin/credit-packs",
  "/admin/legal",
  "/admin/updates",
];

/** Pages that belong to App Settings (they show its menu). */
export const isSettingsPath = (pathname: string) =>
  SETTINGS_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export const isActiveLink = (pathname: string, href: string) =>
  pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
