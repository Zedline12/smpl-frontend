"use client";

import { create } from "zustand";

/**
 * What we sell, by kind: third-party models, Smpl generators (our white-label generators)
 * and Smpl compute (tools on our servers), plus our studio pages. Names, descriptions and
 * visibility come from the backend (admins can change them); the bundled defaults in
 * models.enum.tsx show until it loads. Users never see what a generator runs on.
 */
export type OfferingKind = "model" | "generator" | "compute";

/** The looping video or still on a model's card in Create. */
export interface Thumbnail {
  type: "video" | "image";
  url: string;
}

export interface Offering {
  id: string;
  kind: OfferingKind;
  mediaType: "image" | "video" | "audio" | "text";
  name: string;
  description: string;
  surfaces: ("create" | "edit" | "studio")[];
  /** Whose model it is (third-party models only). */
  provider: string | null;
  /** Turned off by an admin: hidden from pickers, refused by the backend. */
  enabled: boolean;
  /** Set in App Appearance; null: the bundled default below. */
  thumbnail?: Thumbnail | null;
}

export interface Studio {
  id: string;
  name: string;
  description: string;
  route: string;
  offerings: string[];
  enabled: boolean;
}

export interface CatalogData {
  offerings: Offering[];
  studios: Studio[];
}

/** Section labels for pickers, in the order they're shown. */
export const KIND_SECTIONS: { kind: OfferingKind; label: string }[] = [
  { kind: "generator", label: "Smpl" },
  { kind: "model", label: "Models" },
  { kind: "compute", label: "Tools" },
];

// Kinds before the catalog loads (the backend registry is the source of truth).
const DEFAULT_GENERATORS = new Set([
  "smpl-gensu",
  "smpl-remix",
  "smpl-ripper",
  "smpl-ad-multiplier",
  "smpl-artist",
  "smpl-artist-video-clip",
  "smpl-voice-changer",
  "smpl-ai-influencer",
  "smpl-ads-studio",
  "video-analyzer",
  "video-analyzer-script",
  "video-clipping",
]);
const DEFAULT_COMPUTE = new Set([
  "smpl-image-reframe",
  "smpl-image-upscale",
  "smpl-video-reframe",
  "smpl-video-fps-boost",
  "smpl-video-upscale",
]);

// Bundled card media (R2 bucket smpl-ui / "Models Selection Thumbnail Videos"), shown
// until an admin sets one in App Appearance → Model Thumbnails.
const THUMBS = "https://pub-c9ce2e0e90ea4982abdc05b1e4bd66bb.r2.dev/Models%20Selection%20Thumbnail%20Videos/";
const video = (file: string): Thumbnail => ({ type: "video", url: THUMBS + encodeURIComponent(file) });
const image = (file: string): Thumbnail => ({ type: "image", url: THUMBS + encodeURIComponent(file) });
export const DEFAULT_THUMBNAILS: Record<string, Thumbnail> = {
  "smpl-gensu": video("Smpl Riven.mp4"),
  "smpl-ad-multiplier": video("ads-multiplier.mp4"),
  "smpl-artist": video("ARTIST.mp4"),
  "grok-imagine-video-1.5": video("GROK.mp4"),
  "kling-v3-image-to-video": video("KLING IMAGE TO VIDEO.mp4"),
  "kling-v3-pro-motion-control": video("Kling Motion Control.mp4"),
  "seedance-2.5": video("SEEDANCE 2.5.mp4"),
  "fal-seedance-2.5": video("SEEDANCE 2.5.mp4"),
  "seedance-2-0": video("SEEDDANCE 2.0.mp4"),
  "veo-3": video("VEO 3.mp4"),
  "gpt-image-2": image("CHAT GPT IMAGE.png"),
  "kling-o3-image": image("KLING 03 IMAGE.png"),
  "gemini-flash-image": image("Nano Bananna.png"),
  "seedream-v4-5": image("SEEDREAM.jpeg"),
};

const STORAGE_KEY = "smpl:catalog:v1";

/** The last catalog this browser saw (read after hydration, so SSR markup matches). */
export function readCachedCatalog(): CatalogData | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CatalogData) : null;
  } catch {
    return null;
  }
}

function index(data: CatalogData | null) {
  return {
    byId: new Map((data?.offerings ?? []).map((o) => [o.id, o])),
    studios: data ? data.studios : null,
  };
}

interface CatalogState {
  byId: Map<string, Offering>;
  /** Null until the catalog has loaded once. */
  studios: Studio[] | null;
  /** Bumps on every load, so subscribed components re-render with new names. */
  version: number;
  set: (data: CatalogData) => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  ...index(null),
  version: 0,
  set: (data) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
    set((s) => ({ ...index(data), version: s.version + 1 }));
  },
}));

const current = (id: string) => useCatalogStore.getState().byId.get(id);

/** The name users see; the fallback (bundled default) until the catalog loads. */
export function offeringName(id: string, fallback?: string): string {
  return current(id)?.name ?? fallback ?? id;
}

export function offeringDescription(id: string, fallback = ""): string {
  return current(id)?.description ?? fallback;
}

export function offeringKind(id: string): OfferingKind {
  return current(id)?.kind ?? (DEFAULT_GENERATORS.has(id) ? "generator" : DEFAULT_COMPUTE.has(id) ? "compute" : "model");
}

/** Whose model it is (third-party models only, once the catalog has loaded). */
export function offeringProvider(id: string): string | null {
  return current(id)?.provider ?? null;
}

/** The card media: the admin's choice, else the bundled default, else none. */
export function offeringThumbnail(id: string): Thumbnail | null {
  return current(id)?.thumbnail ?? DEFAULT_THUMBNAILS[id] ?? null;
}

/** False when an admin turned it off (hide it; the backend refuses it). */
export function isOfferingEnabled(id: string): boolean {
  return current(id)?.enabled !== false;
}

/** Bundled definitions with the catalog's names and descriptions, hidden ones left out. */
export function withCatalog<T extends { id: string; name: string; description: string }>(list: T[]): T[] {
  return list
    .filter((m) => isOfferingEnabled(m.id))
    .map((m) => ({ ...m, name: offeringName(m.id, m.name), description: offeringDescription(m.id, m.description) }));
}

/** A list split into Smpl / Models / Tools sections (empty sections left out). */
export function groupByKind<T extends { id: string }>(list: T[]): { kind: OfferingKind; label: string; items: T[] }[] {
  return KIND_SECTIONS.map((s) => ({ ...s, items: list.filter((m) => offeringKind(m.id) === s.kind) })).filter(
    (s) => s.items.length > 0,
  );
}

/** Studio pages in order, with their names; null until the catalog has loaded. */
export function catalogStudios(): Studio[] | null {
  return useCatalogStore.getState().studios;
}

/**
 * Re-renders the component when the catalog loads or changes, so the helpers above
 * (and getModel / the model lists) show the current names.
 */
export function useCatalog() {
  const version = useCatalogStore((s) => s.version);
  return {
    /** Changes whenever names may have: a memo dependency. */
    version,
    offeringName,
    offeringDescription,
    offeringKind,
    offeringProvider,
    isOfferingEnabled,
    offeringThumbnail,
    withCatalog,
    groupByKind,
    studios: useCatalogStore.getState().studios,
  };
}
