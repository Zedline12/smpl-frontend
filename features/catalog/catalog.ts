"use client";

import { create } from "zustand";

/**
 * What we sell, by kind: third-party models, Smpl generators (our white-label generators)
 * and Smpl compute (tools on our servers), plus our studio pages. Names, descriptions and
 * visibility come from the backend (admins can change them); the bundled defaults in
 * models.enum.tsx show until it loads. Users never see what a generator runs on.
 */
export type OfferingKind = "model" | "generator" | "compute";

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
  "smpl-ad-multiplier",
  "smpl-artist",
  "smpl-voice-changer",
  "smpl-ai-influencer",
  "smpl-ads-studio",
  "video-analyzer",
  "video-clipping",
]);
const DEFAULT_COMPUTE = new Set([
  "smpl-image-reframe",
  "smpl-image-upscale",
  "smpl-video-reframe",
  "smpl-video-fps-boost",
  "smpl-video-upscale",
]);

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
    withCatalog,
    groupByKind,
    studios: useCatalogStore.getState().studios,
  };
}
