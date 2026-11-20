"use client";
import { Clapperboard, House, Scissors } from "lucide-react";
import {
  StudioSidebar,
  type StudioNavIcon,
  type StudioNavSection,
} from "@/components/studio/StudioSidebar";
import {
  CLIPPING_PLATFORMS,
  ClippingPlatformId,
  PlatformIcon,
} from "../platforms";

/** A platform logo in the shape the studio nav expects. */
const platformIcon = (id: ClippingPlatformId): StudioNavIcon => {
  const Icon = ({ className }: { className?: string }) => (
    <PlatformIcon id={id} className={className} />
  );
  Icon.displayName = `PlatformIcon(${id})`;
  return Icon;
};

const HOME = { href: "/clipping-studio", label: "Home", icon: House };
const SECTIONS: StudioNavSection[] = [
  {
    label: "My clips",
    items: [
      {
        href: "/clipping-studio/clips",
        label: "All clips",
        icon: Clapperboard,
      },
      ...CLIPPING_PLATFORMS.map((p) => ({
        href: `/clipping-studio/clips/${p.slug}`,
        label: p.label,
        icon: platformIcon(p.id),
      })),
    ],
  },
];

/** Clipping Studio's own nav, the same as Ads Studio's. */
export function ClippingSidebar() {
  return (
    <StudioSidebar
      title="Clipping Studio"
      icon={Scissors}
      home={HOME}
      sections={SECTIONS}
      storageKey="clipping-studio:sidebar-collapsed"
    />
  );
}
