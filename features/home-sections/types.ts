import type { Template } from "@/features/templates/types";

/**
 * Custom home page sections (backend modules/home-sections; admins edit them in
 * App Appearance → Homepage Sections). Kept in sync with the backend's domain/home-section.ts.
 */

export const HOME_SECTION_TYPES = ["media", "templates", "cards", "hero"] as const;
export type HomeSectionType = (typeof HOME_SECTION_TYPES)[number];

export const HOME_SECTION_TYPE_LABELS: Record<HomeSectionType, string> = {
  media: "Photos & videos grid",
  templates: "Templates grid",
  cards: "Visual cards",
  hero: "Hero banner",
};

export const HEADER_ALIGNS = ["left", "center", "right", "none"] as const;
export type HeaderAlign = (typeof HEADER_ALIGNS)[number];

/** Header title color: the theme's primary / secondary, or white. */
export const TITLE_COLORS = ["white", "primary", "secondary"] as const;
export type TitleColor = (typeof TITLE_COLORS)[number];

export const CONTENT_ALIGNS = ["left", "center", "right"] as const;
export type ContentAlign = (typeof CONTENT_ALIGNS)[number];

export type MediaKind = "image" | "video";

export const MEDIA_ASPECT_RATIOS = ["16:9", "4:3", "1:1", "3:4", "9:16"] as const;
export type MediaAspectRatio = (typeof MEDIA_ASPECT_RATIOS)[number];

export const HERO_HEIGHTS = ["sm", "md", "lg"] as const;
export type HeroHeight = (typeof HERO_HEIGHTS)[number];

export const SECTION_COLUMNS = {
  media: [2, 3, 4, 5],
  templates: [2, 3, 4],
  cards: [1, 2, 3, 4],
} as const;

export const HomeSectionLimits = {
  maxNameLength: 80,
  maxTitleLength: 120,
  maxDescriptionLength: 400,
  maxItems: 24,
  maxCaptionLength: 120,
  maxCardTextLength: 600,
  maxUrlLength: 2048,
  maxCssLength: 300,
  maxCtaLabelLength: 40,
} as const;

export interface SectionHeader {
  align: HeaderAlign;
  title: string;
  description: string;
  /** Missing on older sections: white. */
  titleColor?: TitleColor;
}

export interface MediaItem {
  url: string;
  kind: MediaKind;
  caption?: string;
  href?: string;
}

export interface CardItem {
  title: string;
  text: string;
  /** Any CSS background: a color or a gradient. */
  background: string;
  textColor?: string;
  imageUrl?: string;
  href?: string;
}

export interface MediaBody {
  type: "media";
  columns: number;
  aspectRatio: MediaAspectRatio;
  items: MediaItem[];
}

/** "See more" link of a templates section: the title links to it and a button opens it. */
export interface SectionLink {
  href: string;
  /** Button text; empty shows "View all". */
  label: string;
}

export interface TemplatesBody {
  type: "templates";
  columns: number;
  templateIds: string[];
  /** Missing on older sections. */
  link?: SectionLink | null;
}

export interface CardsBody {
  type: "cards";
  columns: number;
  items: CardItem[];
}

export interface HeroBody {
  type: "hero";
  background: { url: string; kind: MediaKind };
  /** Darkening over the background, 0-1. */
  overlay: number;
  align: ContentAlign;
  height: HeroHeight;
  title: string;
  text: string;
  cta: { label: string; href: string } | null;
}

export type HomeSectionBody = MediaBody | TemplatesBody | CardsBody | HeroBody;

/** A section as admins edit it. Dates are ISO strings. */
export interface AdminHomeSection {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  startsAt: string | null;
  expiresAt: string | null;
  header: SectionHeader;
  body: HomeSectionBody;
}

/** A templates body as users get it: the templates themselves. */
export interface TemplatesBodyResolved {
  type: "templates";
  columns: number;
  templates: Template[];
  link?: SectionLink | null;
}

export type PublicHomeSectionBody = Exclude<HomeSectionBody, TemplatesBody> | TemplatesBodyResolved;

/** A section as the home page gets it (GET /home-sections). */
export interface PublicHomeSection {
  id: string;
  header: SectionHeader;
  body: PublicHomeSectionBody;
}

/** A new section's starting body, per type. */
export function blankBody(type: HomeSectionType): HomeSectionBody {
  switch (type) {
    case "media":
      return { type, columns: 3, aspectRatio: "16:9", items: [] };
    case "templates":
      return { type, columns: 3, templateIds: [], link: null };
    case "cards":
      return {
        type,
        columns: 3,
        items: [{ title: "Card title", text: "Some text", background: "linear-gradient(135deg, #6b41ff, #ea4bff)" }],
      };
    case "hero":
      return {
        type,
        background: { url: "", kind: "image" },
        overlay: 0.45,
        align: "left",
        height: "md",
        title: "Hero title",
        text: "",
        cta: { label: "Try it", href: "/create/video" },
      };
  }
}

export type SectionStatus = "live" | "scheduled" | "expired" | "hidden";

/** Where a section stands now (admin badge). */
export function sectionStatus(
  s: Pick<AdminHomeSection, "isActive" | "startsAt" | "expiresAt">,
  now = Date.now(),
): SectionStatus {
  if (!s.isActive) return "hidden";
  if (s.expiresAt && new Date(s.expiresAt).getTime() <= now) return "expired";
  if (s.startsAt && new Date(s.startsAt).getTime() > now) return "scheduled";
  return "live";
}
