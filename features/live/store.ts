import { create } from "zustand";
import { LiveItem, isActive, liveKey } from "./types";

/** Finished items stay in the jobs menu this long. */
const KEEP_FINISHED_MS = 30 * 60 * 1000;

interface LiveState {
  /** The live stream is open; polling hooks pause while it is. */
  connected: boolean;
  /** Server clock minus ours, so progress bars use the server's timestamps correctly. */
  clockOffsetMs: number;
  items: Record<string, LiveItem>;
  setConnected: (connected: boolean) => void;
  setClockOffset: (ms: number) => void;
  /** Adds or updates items, keeping the newest version of each. Returns the previous versions. */
  upsert: (items: LiveItem[]) => Record<string, LiveItem | undefined>;
  reset: () => void;
}

export const useLiveStore = create<LiveState>((set, get) => ({
  connected: false,
  clockOffsetMs: 0,
  items: {},
  setConnected: (connected) => set({ connected }),
  setClockOffset: (clockOffsetMs) => set({ clockOffsetMs }),
  upsert: (incoming) => {
    const items = { ...get().items };
    const previous: Record<string, LiveItem | undefined> = {};
    for (const item of incoming) {
      const key = liveKey(item);
      const old = items[key];
      previous[key] = old;
      // Out-of-order events: never go back to an older version.
      if (old && Date.parse(old.updatedAt) > Date.parse(item.updatedAt)) continue;
      if (item.status === "removed") delete items[key];
      else items[key] = item;
    }
    const cutoff = Date.now() - KEEP_FINISHED_MS;
    for (const [key, item] of Object.entries(items)) {
      if (!isActive(item.status) && Date.parse(item.updatedAt) < cutoff) delete items[key];
    }
    set({ items });
    return previous;
  },
  reset: () => set({ items: {}, connected: false }),
}));

/** The live version of one item (e.g. a brand theme card's progress). */
export function useLiveItem(kind: LiveItem["kind"], id: string | undefined) {
  return useLiveStore((s) => (id ? s.items[`${kind}:${id}`] : undefined));
}
