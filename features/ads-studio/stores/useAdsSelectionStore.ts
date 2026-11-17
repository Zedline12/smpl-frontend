import { create } from "zustand";

/**
 * What the Ads Studio composer has picked from the user's library. Kept outside the
 * model's input so the library pages (Products, Avatars, Brands) can pick too; the
 * picks are merged into the input only when generating.
 */
interface AdsSelectionState {
  productIds: string[];
  avatarId: string | null;
  brandId: string | null;
  toggleProduct: (id: string) => void;
  setProductIds: (ids: string[]) => void;
  setAvatarId: (id: string | null) => void;
  setBrandId: (id: string | null) => void;
}

export const useAdsSelectionStore = create<AdsSelectionState>((set) => ({
  productIds: [],
  avatarId: null,
  brandId: null,
  toggleProduct: (id) =>
    set((s) => ({
      productIds: s.productIds.includes(id)
        ? s.productIds.filter((p) => p !== id)
        : [...s.productIds, id],
    })),
  setProductIds: (productIds) => set({ productIds }),
  setAvatarId: (avatarId) => set({ avatarId }),
  setBrandId: (brandId) => set({ brandId }),
}));
