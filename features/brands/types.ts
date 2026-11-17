/** Same union the generation queues use; note it's "failure", not "failed". */
export type BrandStatus = "pending" | "processing" | "success" | "failure";

export const isActiveStatus = (status: BrandStatus) =>
  status === "pending" || status === "processing";

export const SOCIAL_PLATFORMS = [
  "instagram",
  "tiktok",
  "x",
  "facebook",
  "youtube",
  "linkedin",
  "pinterest",
  "website",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  x: "X",
  facebook: "Facebook",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  website: "Website",
};

export interface BrandSocial {
  platform: SocialPlatform;
  url: string;
}

/** Same limits as the backend's BRAND_LIMITS. */
export const BRAND_LIMITS = {
  name: 120,
  tagline: 200,
  description: 1500,
  audience: 1000,
  font: 120,
  item: 200,
  sellingPoints: 10,
  aesthetics: 12,
  toneOfVoice: 10,
  colors: 12,
  socials: 12,
} as const;

/** A brand kit: identity plus what the ads should say and how they should look. */
export interface Brand {
  id: string;
  userId?: string;
  websiteUrl: string | null;
  name: string;
  status: BrandStatus;
  logoUrl: string | null;
  /** Main colour (#rrggbb); always the first of `colors`. */
  primaryColor: string | null;
  colors: string[];
  headerFont: string | null;
  bodyFont: string | null;
  tagline: string;
  description: string;
  sellingPoints: string[];
  audience: string;
  aesthetics: string[];
  toneOfVoice: string[];
  socials: BrandSocial[];
  errorMessage: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Everything the kit editor saves. */
export type BrandInput = Pick<
  Brand,
  | "name"
  | "websiteUrl"
  | "logoUrl"
  | "primaryColor"
  | "colors"
  | "headerFont"
  | "bodyFont"
  | "tagline"
  | "description"
  | "sellingPoints"
  | "audience"
  | "aesthetics"
  | "toneOfVoice"
  | "socials"
>;

export const emptyBrandInput = (): BrandInput => ({
  name: "",
  websiteUrl: null,
  logoUrl: null,
  primaryColor: null,
  colors: [],
  headerFont: null,
  bodyFont: null,
  tagline: "",
  description: "",
  sellingPoints: [],
  audience: "",
  aesthetics: [],
  toneOfVoice: [],
  socials: [],
});

export const brandToInput = (b: Brand): BrandInput => ({
  name: b.name,
  websiteUrl: b.websiteUrl,
  logoUrl: b.logoUrl,
  primaryColor: b.primaryColor,
  colors: b.colors ?? [],
  headerFont: b.headerFont,
  bodyFont: b.bodyFont,
  tagline: b.tagline ?? "",
  description: b.description ?? "",
  sellingPoints: b.sellingPoints ?? [],
  audience: b.audience ?? "",
  aesthetics: b.aesthetics ?? [],
  toneOfVoice: b.toneOfVoice ?? [],
  socials: b.socials ?? [],
});

/** An in-flight extraction (the UI only relies on `id` and `status`). */
export interface BrandQueue {
  id: string;
  status: BrandStatus;
  websiteUrl?: string | null;
  errorMessage?: string | null;
}
