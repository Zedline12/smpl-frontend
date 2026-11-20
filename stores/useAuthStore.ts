// features/auth/store/useAuthStore.ts
import { User } from "@/features/auth/types/auth";
import { create } from "zustand";

export type AuthModalMode = "sign-in" | "sign-up";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;

  /** The sign-in / sign-up modal (every "Log in" / "Sign up" button opens it). */
  isLoginModalOpen: boolean;
  authModalMode: AuthModalMode;
  openLoginModal: (mode?: AuthModalMode) => void;
  closeLoginModal: () => void;

  setUser: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  isLoginModalOpen: false,
  authModalMode: "sign-up",
  openLoginModal: (mode = "sign-in") =>
    set({ isLoginModalOpen: true, authModalMode: mode }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
