import { create } from "zustand";

type MediaSelectionStore = {
  active: boolean;
  ids: Set<string>;
  /** Starts select mode, optionally with one item already selected. */
  enter: (id?: string) => void;
  toggle: (id: string) => void;
  selectMany: (ids: string[]) => void;
  clear: () => void;
};

export const useMediaSelectionStore = create<MediaSelectionStore>((set) => ({
  active: false,
  ids: new Set(),
  enter: (id) => set({ active: true, ids: new Set(id ? [id] : []) }),
  toggle: (id) =>
    set((state) => {
      const ids = new Set(state.ids);
      if (ids.has(id)) ids.delete(id);
      else ids.add(id);
      return { ids };
    }),
  selectMany: (ids) => set({ ids: new Set(ids) }),
  clear: () => set({ active: false, ids: new Set() }),
}));
