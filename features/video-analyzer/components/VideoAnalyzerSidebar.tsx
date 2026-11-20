"use client";
import { House, Library, ScanLine } from "lucide-react";
import {
  StudioSidebar,
  type StudioNavSection,
} from "@/components/studio/StudioSidebar";

const HOME = { href: "/video-analyzer", label: "Home", icon: House };
const SECTIONS: StudioNavSection[] = [
  {
    label: "Library",
    items: [
      {
        href: "/video-analyzer/analyses",
        label: "My analyses",
        icon: Library,
      },
    ],
  },
];

/** Video Analyzer's own nav, the same as Ads Studio's. */
export function VideoAnalyzerSidebar() {
  return (
    <StudioSidebar
      title="Video Analyzer"
      icon={ScanLine}
      home={HOME}
      sections={SECTIONS}
      storageKey="video-analyzer:sidebar-collapsed"
    />
  );
}
