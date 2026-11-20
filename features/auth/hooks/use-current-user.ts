"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { UserService } from "@/lib/api/services/users.service";

/**
 * Single source of truth for "is someone signed in, and who".
 *
 * The server layouts inject the user into AuthProvider; this keeps the credits
 * balance and the avatar fresh on top of that. Do not gate on
 * `useAuthStore().isAuthenticated` — nothing calls `useAuthBootstrap`, so it is
 * `false` even when signed in.
 */
export function useCurrentUser() {
  // AuthContext defaults to null outside the provider, so never destructure it
  // directly — that throws on any page that doesn't mount AuthProvider.
  const contextUser = useAuth()?.user ?? null;

  const { data } = useQuery({
    // Keyed by user, so a sign-out or a different account never reads the old cache.
    queryKey: ["current-user", contextUser?.id ?? null],
    queryFn: async () => {
      const updated: any = await UserService.getCurrentUser();
      return {
        ...contextUser,
        creditsBalance: updated?.creditsBalance ?? contextUser?.creditsBalance,
        // The generated avatar lands after sign-up; the layout's copy predates it.
        avatarUrl: updated?.avatarUrl ?? contextUser?.avatarUrl ?? null,
      };
    },
    // Signed-out visitors have nothing to refresh.
    enabled: !!contextUser,
  });

  // No session → a guest, whatever is cached.
  const user = contextUser ? (data ?? contextUser) : null;
  return { user, isAuthenticated: !!user };
}
