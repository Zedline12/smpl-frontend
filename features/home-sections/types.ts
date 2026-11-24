import type { Template } from "@/features/templates/types";

/**
 * Home page sections (backend modules/home-sections; admins edit them in
 * App Settings → Homepage). Sections belong to presets; one preset is live.
 * Kept in sync with the backend's domain/home-section.ts.
 */

export const HOME_SECTION_TYPES = [
  "showcase",
  "tools",
  "announcement",
  "media",
  "templates",
  "cards",
  "hero",
  "models",
  "recent",
  "upgrade",
] as const;
export type HomeSectionType = (typeof HOME_SECTION_TYPES)[number];

export const HOME_SECTION_TYPE_LABELS: Record<HomeSectionType, string> = {
  showcase: "Featured videos row",
  tools: "Studio + tool cards",
  announcement: "Announcement bar",
  media: "Photos & videos grid",
  templates: "Templates grid",
  cards: "Visual cards",
  hero: "Hero banner",
  models: "AI models row",
  recent: "Your recent creations",
  upgrade: "Upgrade banner",
};

/** Who sees a section. */
export const SECTION_AUDIENCES = ["all", "guests", "signed_in", "no_plan", "paid"] as const;
export type SectionAudience = (typeof SECTION_AUDIENCES)[number];
export const AUDIENCE_LABELS: Record<SectionAudience, string> = {
  all: "Everyone",
  guests: "Guests",
  signed_in: "Signed in",
  no_plan: "No plan",
  paid: "Paid plan",
};

export const ANNOUNCEMENT_TONES = ["purple", "lime", "neutral", "warning"] as const;
export type AnnouncementTone = (typeof ANNOUNCEMENT_TONES)[number];
export const RECENT_MEDIA_TYPES = ["all", "image", "video", "audio"] as const;
export type RecentMediaType = (typeof RECENT_MEDIA_TYPES)[number];

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
  recent: [3, 4, 5, 6],
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
  maxShowcaseItems: 12,
  maxStatusItems: 6,
  maxThumbs: 3,
  maxBadgeLength: 16,
  maxToolItems: 12,
  minRecent: 3,
  maxRecent: 12,
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

export interface Cta {
  label: string;
  href: string;
}

export interface ShowcaseItem {
  title: string;
  description: string;
  video: string;
  poster?: string;
  href: string;
  badge?: string;
}
export interface ShowcaseBody {
  type: "showcase";
  items: ShowcaseItem[];
}

export interface ToolItem {
  /** A key of TOOL_ICONS (components/FeatureGrid). */
  icon: string;
  title: string;
  description: string;
  badge?: string;
  highlighted?: boolean;
  href: string;
}
export interface ToolsPromo {
  title: string;
  subtitle: string;
  cta: Cta | null;
  statusItems: { label: string; accent?: boolean }[];
  /** Up to 3; empty strings show a placeholder tile. */
  thumbUrls: string[];
}
export interface ToolsBody {
  type: "tools";
  promo: ToolsPromo | null;
  items: ToolItem[];
}

export interface AnnouncementBody {
  type: "announcement";
  text: string;
  cta: Cta | null;
  tone: AnnouncementTone;
  dismissible: boolean;
}

export interface ModelItem {
  name: string;
  logoUrl?: string;
  description?: string;
  badge?: string;
  href: string;
}
export interface ModelsBody {
  type: "models";
  items: ModelItem[];
}

export interface RecentBody {
  type: "recent";
  mediaType: RecentMediaType;
  limit: number;
  columns: number;
  link: SectionLink | null;
}

export interface UpgradeBody {
  type: "upgrade";
  title: string;
  text: string;
  cta: Cta;
  background: string;
  imageUrl?: string;
}

export type HomeSectionBody =
  | MediaBody
  | TemplatesBody
  | CardsBody
  | HeroBody
  | ShowcaseBody
  | ToolsBody
  | AnnouncementBody
  | ModelsBody
  | RecentBody
  | UpgradeBody;

/** A saved home page layout. One is live. */
export interface HomePreset {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  activatedAt: string | null;
  sectionCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

/** A section as admins edit it. Dates are ISO strings. */
export interface AdminHomeSection {
  id: string;
  presetId: string;
  name: string;
  audience: SectionAudience;
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
  /** Changes when the section is edited. */
  updatedAt?: string | null;
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
    case "showcase":
      return {
        type,
        items: [{ title: "New tool", description: "What it does, in one line.", video: "", href: "/create/video" }],
      };
    case "tools":
      return {
        type,
        promo: {
          title: "Smpl Studio",
          subtitle: "Your AI creative suite — all models, one workspace.",
          cta: { label: "Create", href: "/create/video" },
          statusItems: [{ label: "Veo 3 generation complete", accent: true }, { label: "Kling v3 rendering…" }],
          thumbUrls: ["", "", ""],
        },
        items: [{ icon: "Film", title: "Tool", description: "What it does.", href: "/create/video" }],
      };
    case "announcement":
      return { type, text: "Something new just launched.", cta: { label: "Try it", href: "/create/video" }, tone: "purple", dismissible: true };
    case "models":
      return { type, items: [{ name: "Veo 3", description: "Video with sound", badge: "NEW", href: "/create/video" }] };
    case "recent":
      return { type, mediaType: "all", limit: 8, columns: 4, link: { href: "/assets", label: "See all" } };
    case "upgrade":
      return {
        type,
        title: "Unlock every model",
        text: "Get monthly credits and full access to every studio.",
        cta: { label: "See plans", href: "/pricing" },
        background: "linear-gradient(135deg, #6b41ff, #ea4bff)",
      };
  }
}

/** Header a new section starts with: compact types have none. */
export function blankHeader(type: HomeSectionType): SectionHeader {
  return ["hero", "showcase", "tools", "announcement", "upgrade"].includes(type)
    ? { align: "none", title: "", description: "" }
    : { align: "left", title: type === "recent" ? "Your recent creations" : "Section title", description: "" };
}

/** Audience a new section starts with. */
export const defaultAudience = (type: HomeSectionType): SectionAudience =>
  type === "upgrade" ? "no_plan" : type === "recent" ? "signed_in" : "all";

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
