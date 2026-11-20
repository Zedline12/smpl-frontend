import { create } from "zustand";

interface OutOfCreditsState {
  open: boolean;
  /** Credits the refused action needed, when the backend said. */
  required: number | null;
  show: (required?: number | null) => void;
  hide: () => void;
}

/** The "not enough credits" popup (opened by the fetch watcher on INSUFFICIENT_CREDITS). */
export const useOutOfCreditsStore = create<OutOfCreditsState>((set) => ({
  open: false,
  required: null,
  show: (required = null) => set({ open: true, required }),
  hide: () => set({ open: false }),
}));
