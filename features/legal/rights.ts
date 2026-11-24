"use client";

import { create } from "zustand";

/** The one-time rights / consent confirmations some tools need (backend LegalService RIGHTS_FEATURES). */
export type RightsFeature = "likeness" | "source_video";

export const RIGHTS_TEXT: Record<RightsFeature, { title: string; text: string }> = {
  likeness: {
    title: "Real people, faces and voices",
    text: "I own these files or have permission to use them, and every identifiable person whose face, body or voice I use has consented. I will not make sexual or intimate content of real people, content of minors, or content meant to deceive, impersonate or harass anyone. I will keep AI labels on what I share.",
  },
  source_video: {
    title: "Videos you bring in",
    text: "I own this video or have the rights to use and change it. I will not use smpl to remove watermarks, credits or copyright information from other people's work.",
  },
};

interface RightsPromptState {
  features: RightsFeature[];
  resolve: ((ok: boolean) => void) | null;
  ask: (features: RightsFeature[]) => Promise<boolean>;
  close: (ok: boolean) => void;
}

/** Drives <RightsDialog/>: ask() opens it and resolves with the user's answer. */
export const useRightsPrompt = create<RightsPromptState>((set, get) => ({
  features: [],
  resolve: null,
  ask: (features) =>
    new Promise<boolean>((resolve) => {
      get().resolve?.(false);
      set({ features, resolve });
    }),
  close: (ok) => {
    get().resolve?.(ok);
    set({ features: [], resolve: null });
  },
}));

/** Records the confirmations (one call per feature). */
export async function confirmRights(features: RightsFeature[]): Promise<void> {
  for (const feature of features) {
    const res = await fetch("/api/me/legal/rights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature }),
    });
    if (!res.ok) throw new Error("Couldn't save your confirmation");
  }
}

/** The features a "RIGHTS_REQUIRED" error asks for (null for any other error). */
export function rightsRequired(json: unknown): RightsFeature[] | null {
  type Shape = { code?: string | null; details?: { features?: string[] } | null };
  const j = json as { error?: Shape | string } & Shape;
  // Backend shape { error: { code, details } }, or a proxy's flat { code, details }.
  const err: Shape | undefined = typeof j?.error === "object" && j.error ? j.error : j;
  if (err?.code !== "RIGHTS_REQUIRED") return null;
  const f = (err.details?.features ?? []).filter((x): x is RightsFeature => x === "likeness" || x === "source_video");
  return f.length ? f : ["likeness"];
}

/**
 * Runs a request; if the server says a rights confirmation is missing, asks the user
 * once, saves it and runs the request again. Returns the final Response.
 */
export async function withRights(run: () => Promise<Response>): Promise<Response> {
  const res = await run();
  // The generation proxy answers 200 even for errors, so always look at the body.
  const json = await res.clone().json().catch(() => null);
  const features = rightsRequired(json);
  if (!features) return res;
  const ok = await useRightsPrompt.getState().ask(features);
  if (!ok) return res;
  await confirmRights(features);
  return run();
}
