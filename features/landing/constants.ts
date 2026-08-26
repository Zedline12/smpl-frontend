import {
  FolderOpen,
  Images,
  LucideIcon,
  Palette,
  Scissors,
  Sparkles,
  Wand2,
} from "lucide-react";

export interface LandingFeature {
  href: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  isNew?: boolean;
}

/** The `isNew` flags mirror STUDIOS in components/StudioLinks.tsx — keep them in step. */
export const LANDING_FEATURES: LandingFeature[] = [
  {
    href: "/create",
    title: "Start Generating",
    subtitle: "Images, video and audio from a prompt.",
    icon: Sparkles,
  },
  {
    href: "/prompt-maker",
    title: "Prompt Maker",
    subtitle: "Turn an idea into a model-tuned prompt.",
    icon: Wand2,
  },
  {
    href: "/marketing-studio/brand-themes",
    title: "Marketing Studio",
    subtitle: "Pull a brand's colours, fonts and logo.",
    icon: Palette,
    isNew: true,
  },
  {
    href: "/clipping-studio",
    title: "Clipping Studio",
    subtitle: "Cut long videos into shareable clips.",
    icon: Scissors,
    isNew: true,
  },
  {
    href: "/assets",
    title: "Your Creations",
    subtitle: "Everything you've generated, in one place.",
    icon: Images,
  },
  {
    href: "/projects",
    title: "Projects",
    subtitle: "Keep each brand or campaign separate.",
    icon: FolderOpen,
  },
];

export const HERO_VIDEO_SRC = "/assets/hero-promo.mp4";

export const HERO_BULLETS = [
  "10+ models in one place",
  "No editing skills needed",
  "Free credits to start",
];
