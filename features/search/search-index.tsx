import type { ReactNode } from "react";
import {
  AudioLines,
  Bell,
  Clapperboard,
  Coins,
  FolderKanban,
  Gem,
  Home,
  Image as ImageIcon,
  Images,
  LifeBuoy,
  Megaphone,
  Music,
  Package,
  PenLine,
  Repeat,
  Scissors,
  ScanSearch,
  Sparkles,
  Tag,
  Terminal,
  UserRound,
  Users,
  Video,
} from "lucide-react";
import {
  AUDIO_MODELS,
  IMAGE_MODELS,
  Model,
  VIDEO_MODELS,
  isEditTool,
} from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { STUDIOS } from "@/components/StudioLinks";
import { NAV_ROWS } from "@/components/AccountMenuPanel";

export type SearchKind = "model" | "page" | "feature" | "setting";

export interface SearchItem {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  icon: ReactNode;
  keywords?: string;
  badge?: "new" | "trending";
  /** Models only: what the composer is switched to before navigating. */
  mediaType?: GenerationTypeEnum;
  modelId?: string;
}

const lucide = (Icon: typeof Sparkles) => <Icon className="size-[18px]" strokeWidth={1.75} />;

// ── Models ──────────────────────────────────────────────────────────────────

const modelItems = (models: Model[], type: GenerationTypeEnum): SearchItem[] =>
  models.map((m) => ({
    id: `model:${m.id}`,
    kind: "model",
    title: m.name,
    subtitle: m.description,
    href: `/create/${type}?model=${encodeURIComponent(m.id)}`,
    icon: m.svg,
    keywords: `${type} model ${m.id}${isEditTool(m.id) ? " edit upscale reframe enhance" : ""}`,
    mediaType: type,
    modelId: m.id,
  }));

// ── Pages ───────────────────────────────────────────────────────────────────

/** What the studio links in the navbar don't say about themselves. */
const STUDIO_DETAILS: Record<string, { subtitle: string; icon: ReactNode; keywords: string }> = {
  "/clipping-studio": {
    subtitle: "Turn long videos into short clips",
    icon: lucide(Scissors),
    keywords: "clips shorts reels cut highlights",
  },
  "/ai-influencer-studio": {
    subtitle: "Create and manage your AI influencer",
    icon: lucide(UserRound),
    keywords: "influencer character persona avatar",
  },
  "/ads-studio": {
    subtitle: "Ready-to-use ads from a brief and your products",
    icon: lucide(Megaphone),
    keywords: "ads marketing campaign product brand",
  },
  "/artist": {
    subtitle: "Full songs, and your character performing them",
    icon: lucide(Music),
    keywords: "music song lyrics dj singer",
  },
  "/remix": {
    subtitle: "Drop your character into any video",
    icon: lucide(Repeat),
    keywords: "remix swap character video",
  },
};

const studioItems: SearchItem[] = STUDIOS.filter((s) => STUDIO_DETAILS[s.href]).map((s) => ({
  id: `page:${s.href}`,
  kind: "page",
  title: s.label,
  href: s.href,
  badge: s.isNew ? "new" : undefined,
  ...STUDIO_DETAILS[s.href],
}));

const pageItems: SearchItem[] = [
  { id: "page:/home", kind: "page", title: "Home", subtitle: "Start here", href: "/home", icon: lucide(Home), keywords: "start dashboard" },
  { id: "page:/create/image", kind: "page", title: "Create Image", subtitle: "Generate images from a prompt", href: "/create/image", icon: lucide(ImageIcon), keywords: "picture photo generate" },
  { id: "page:/create/video", kind: "page", title: "Create Video", subtitle: "Generate videos from text or images", href: "/create/video", icon: lucide(Video), keywords: "clip film generate animate" },
  { id: "page:/create/audio", kind: "page", title: "Create Audio", subtitle: "Speech and voice", href: "/create/audio", icon: lucide(AudioLines), keywords: "sound voice speech tts" },
  ...studioItems,
  { id: "page:/video-analyzer", kind: "page", title: "Video Analyzer", subtitle: "Break down what makes a video work", href: "/video-analyzer", icon: lucide(ScanSearch), keywords: "analyze analysis breakdown" },
  { id: "page:/prompt-maker", kind: "page", title: "Prompt Maker", subtitle: "Write better prompts", href: "/prompt-maker", icon: lucide(PenLine), keywords: "prompt writer helper" },
  { id: "page:/assets", kind: "page", title: "Assets", subtitle: "Everything you've generated and uploaded", href: "/assets", icon: lucide(Images), keywords: "my media library files uploads gallery" },
  { id: "page:/projects", kind: "page", title: "Projects", subtitle: "Your generations, organised", href: "/projects", icon: lucide(FolderKanban), keywords: "folders collections" },
  { id: "page:/pricing", kind: "page", title: "Pricing", subtitle: "Plans and credits", href: "/pricing", icon: lucide(Gem), keywords: "plans upgrade premium price cost" },
];

// ── Features (things inside pages) ──────────────────────────────────────────

const featureItems: SearchItem[] = [
  { id: "feature:brands", kind: "feature", title: "Brands", subtitle: "Your brand kits for Ads Studio", href: "/ads-studio/brands", icon: lucide(Tag), keywords: "brand kit logo colors colours fonts website palette" },
  { id: "feature:new-brand", kind: "feature", title: "New brand kit", subtitle: "Read a brand from your website", href: "/ads-studio/brands/create", icon: lucide(Sparkles), keywords: "create brand website extract kit" },
  { id: "feature:products", kind: "feature", title: "Products", subtitle: "Product photos for your ads", href: "/ads-studio/products", icon: lucide(Package), keywords: "product upload photos items" },
  { id: "feature:avatars", kind: "feature", title: "Avatars", subtitle: "People to feature in your ads", href: "/ads-studio/avatars", icon: lucide(Users), keywords: "avatar model person face actor" },
  { id: "feature:ads-media", kind: "feature", title: "Ads media", subtitle: "Every ad you've made", href: "/ads-studio/media", icon: lucide(Clapperboard), keywords: "ads history gallery" },
  { id: "feature:motion-transfer", kind: "feature", title: "Motion Transfer", subtitle: "Copy the motion of one video onto another", href: "/create/motion-transfer", icon: lucide(Video), keywords: "gensu motion dance transfer" },
  { id: "feature:mcp", kind: "feature", title: "MCP & CLI", subtitle: "Use smpl from Claude and other AI tools", href: "/me/settings/mcp", icon: lucide(Terminal), keywords: "mcp cli api claude integration automate", badge: "new" },
];

// ── Settings ────────────────────────────────────────────────────────────────

const SETTING_SUBTITLES: Record<string, string> = {
  "/me/settings/account": "Name, email and password",
  "/me/settings/usage": "Credits used and remaining",
  "/me/settings/referrals": "Earn by inviting people",
  "/me/settings/subscription": "Your plan and billing",
  "/me/settings/appearance": "Theme and look",
};

const settingItems: SearchItem[] = [
  ...NAV_ROWS.map((row) => ({
    id: `setting:${row.href}`,
    kind: "setting" as const,
    title: row.label,
    subtitle: SETTING_SUBTITLES[row.href] ?? "Settings",
    href: row.href,
    icon: lucide(row.icon),
    keywords: "settings account profile",
    badge: row.isNew ? ("new" as const) : undefined,
  })),
  { id: "setting:credits", kind: "setting", title: "Buy credits", subtitle: "Top up with a credit pack", href: "/me/settings/subscription#credit-packs", icon: lucide(Coins), keywords: "credits top up pack purchase billing" },
  { id: "setting:notifications", kind: "setting", title: "Notifications", subtitle: "Emails and alerts", href: "/me/settings/notifications", icon: lucide(Bell), keywords: "settings email alerts" },
  { id: "setting:support", kind: "setting", title: "Support", subtitle: "Get help from our team", href: "/me/settings/support", icon: lucide(LifeBuoy), keywords: "help contact bug problem" },
  { id: "setting:mcp", kind: "setting", title: "MCP", subtitle: "Connect AI tools to your account", href: "/me/settings/mcp", icon: lucide(Terminal), keywords: "settings mcp api key integration" },
];

export const SEARCH_ITEMS: SearchItem[] = [
  ...modelItems(IMAGE_MODELS, GenerationTypeEnum.IMAGE),
  ...modelItems(VIDEO_MODELS, GenerationTypeEnum.VIDEO),
  ...modelItems(AUDIO_MODELS, GenerationTypeEnum.AUDIO),
  ...pageItems,
  ...featureItems,
  ...settingItems,
];

const BY_ID = new Map(SEARCH_ITEMS.map((i) => [i.id, i]));
const pick = (ids: string[]) => ids.map((id) => BY_ID.get(id)).filter((i): i is SearchItem => !!i);

// ── Browse view ─────────────────────────────────────────────────────────────

export interface PopularCard {
  item: SearchItem;
  label: string;
  /** Card background. */
  gradient: string;
}

export const POPULAR: PopularCard[] = [
  { id: "page:/ads-studio", label: "Ads", gradient: "linear-gradient(135deg, #6b41ff 0%, #3b1f8f 55%, #1c1433 100%)" },
  { id: "page:/ai-influencer-studio", label: "Influencer", gradient: "linear-gradient(135deg, #ea4bff 0%, #9b2c6b 50%, #2a1420 100%)" },
  { id: "page:/artist", label: "Music", gradient: "linear-gradient(135deg, #2fcefd 0%, #1d6f8f 50%, #12242e 100%)" },
].flatMap(({ id, ...rest }) => {
  const item = BY_ID.get(id);
  return item ? [{ item, ...rest }] : [];
});

/** Curated, each with the badge the list shows next to it. */
export const TRENDING: SearchItem[] = (
  [
    ["feature:mcp", "new"],
    ["model:seedance-2.5", undefined],
    ["page:/ai-influencer-studio", "trending"],
    ["model:gemini-flash-image", undefined],
    ["feature:brands", "new"],
    ["model:smpl-voice-changer", undefined],
  ] as const
).flatMap(([id, badge]) => {
  const item = BY_ID.get(id);
  return item ? [{ ...item, badge }] : [];
});

// ── Matching ────────────────────────────────────────────────────────────────

function score(item: SearchItem, q: string): number {
  const title = item.title.toLowerCase();
  if (title.startsWith(q)) return 4;
  if (title.split(/[\s\-()]+/).some((w) => w.startsWith(q))) return 3;
  if (title.includes(q)) return 2;
  if (item.keywords?.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)) return 1;
  return 0;
}

/** Items matching every word of the query, best first; ties keep the index order. */
export function searchItems(items: SearchItem[], query: string): SearchItem[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return items;
  return items
    .map((item, index) => {
      const scores = words.map((w) => score(item, w));
      return { item, index, total: scores.every(Boolean) ? scores.reduce((a, b) => a + b, 0) : 0 };
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total || a.index - b.index)
    .map((r) => r.item);
}

// ── Recents (this browser only) ─────────────────────────────────────────────

const RECENTS_KEY = "smpl:search-recents";
const RECENTS_MAX = 3;

export function readRecents(): SearchItem[] {
  try {
    const ids: unknown = JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]");
    return Array.isArray(ids) ? pick(ids.filter((id): id is string => typeof id === "string")) : [];
  } catch {
    return [];
  }
}

export function rememberRecent(id: string) {
  try {
    const ids = [id, ...readRecents().map((i) => i.id).filter((x) => x !== id)].slice(0, RECENTS_MAX);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked: recents just don't stick.
  }
}

export const KIND_LABELS: Record<SearchKind, string> = {
  model: "Models",
  page: "Pages",
  feature: "Features",
  setting: "Settings",
};
