"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { UserService } from "@/lib/api/services/users.service";

/**
 * Single source of truth for "is someone signed in, and who".
 *
 * The server layouts inject the user into AuthProvider; this keeps the credits
 * balance fresh on top of that. Do not gate on `useAuthStore().isAuthenticated`
 * — nothing calls `useAuthBootstrap`, so it is `false` even when signed in.
 */
export function useCurrentUser() {
  // AuthContext defaults to null outside the provider, so never destructure it
  // directly — that throws on any page that doesn't mount AuthProvider.
  const contextUser = useAuth()?.user ?? null;

  const { data: user = contextUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const updated = await UserService.getCurrentUser();
      return { ...contextUser, creditsBalance: updated.creditsBalance };
    },
    // Signed-out visitors have nothing to refresh.
    enabled: !!contextUser,
  });

  return { user, isAuthenticated: !!user };
}
