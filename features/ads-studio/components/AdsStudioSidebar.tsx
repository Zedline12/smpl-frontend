"use client";
import {
  CircleUserRound,
  House,
  Images,
  Megaphone,
  Package,
  Palette,
} from "lucide-react";
import {
  StudioSidebar,
  type StudioNavSection,
} from "@/components/studio/StudioSidebar";

const HOME = { href: "/ads-studio", label: "Home", icon: House };
const SECTIONS: StudioNavSection[] = [
  {
    label: "Assets",
    items: [
      { href: "/ads-studio/media", label: "All media", icon: Images },
      { href: "/ads-studio/brands", label: "Brands", icon: Palette },
      { href: "/ads-studio/products", label: "Products", icon: Package },
      { href: "/ads-studio/avatars", label: "Avatars", icon: CircleUserRound },
    ],
  },
];

/** Ads Studio's own nav: a collapsible sidebar on desktop, a pill row on phones. */
export function AdsStudioSidebar() {
  return (
    <StudioSidebar
      title="Ads Studio"
      icon={Megaphone}
      home={HOME}
      sections={SECTIONS}
      storageKey="ads-studio:sidebar-collapsed"
    />
  );
}
