/** Announcement popups ("broadcasts"); mirrors smpl-backend/src/modules/broadcasts/domain. */

export const BROADCAST_AUDIENCES = ["all", "no_plan", "paid"] as const;
export type BroadcastAudience = (typeof BROADCAST_AUDIENCES)[number];
export const AUDIENCE_LABELS: Record<BroadcastAudience, string> = {
  all: "All signed-in",
  no_plan: "Free (no plan)",
  paid: "Paid",
};

export const BROADCAST_LAYOUTS = ["image_top", "image_left", "background"] as const;
export type BroadcastLayout = (typeof BROADCAST_LAYOUTS)[number];
export const LAYOUT_LABELS: Record<BroadcastLayout, string> = {
  image_top: "Image on top",
  image_left: "Image beside",
  background: "Full background",
};

export const BROADCAST_SIZES = ["sm", "md", "lg"] as const;
export const BROADCAST_ALIGNS = ["left", "center"] as const;
export const BROADCAST_BUTTON_STYLES = ["primary", "secondary", "link"] as const;

export type BroadcastStatus = "disabled" | "scheduled" | "live" | "ended";
export const STATUS_LABELS: Record<BroadcastStatus, string> = {
  disabled: "Off",
  scheduled: "Scheduled",
  live: "Live",
  ended: "Ended",
};

export const BroadcastLimits = {
  maxNameLength: 80,
  maxBadgeLength: 24,
  maxTitleLength: 120,
  maxBodyLength: 1000,
  maxButtons: 3,
  maxButtonLabelLength: 40,
  maxUrlLength: 2048,
  maxCssLength: 300,
  minPriority: -100,
  maxPriority: 100,
} as const;

export interface BroadcastButton {
  label: string;
  href: string;
  style: (typeof BROADCAST_BUTTON_STYLES)[number];
  newTab: boolean;
}

export interface BroadcastDesign {
  layout: BroadcastLayout;
  media: { url: string; kind: "image" | "video" } | null;
  badge: string;
  title: string;
  body: string;
  align: (typeof BROADCAST_ALIGNS)[number];
  size: (typeof BROADCAST_SIZES)[number];
  background: string;
  textColor: string;
  accent: string;
  buttons: BroadcastButton[];
}

export interface BroadcastStats {
  views: number;
  closes: number;
  clicks: number;
  clicksByButton: number[];
  clickRate: number;
}

/** What a user gets. */
export interface PublicBroadcast {
  id: string;
  design: BroadcastDesign;
}

export interface AdminBroadcast {
  id: string;
  name: string;
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  audience: BroadcastAudience;
  priority: number;
  design: BroadcastDesign;
  status: BroadcastStatus;
  stats: BroadcastStats;
  createdAt?: string;
  updatedAt?: string;
}

export type BroadcastInput = Pick<
  AdminBroadcast,
  "name" | "enabled" | "startsAt" | "endsAt" | "audience" | "priority" | "design"
>;

export const blankDesign = (): BroadcastDesign => ({
  layout: "image_top",
  media: null,
  badge: "NEW",
  title: "Something new is here",
  body: "Tell people what's new and why they'll love it.",
  align: "center",
  size: "md",
  background: "linear-gradient(135deg, #1b1033, #0b0b10)",
  textColor: "#ffffff",
  accent: "#6b41ff",
  buttons: [{ label: "Try it now", href: "/", style: "primary", newTab: false }],
});

export const blankBroadcast = (): BroadcastInput => ({
  name: "",
  enabled: false,
  startsAt: null,
  endsAt: null,
  audience: "all",
  priority: 0,
  design: blankDesign(),
});
