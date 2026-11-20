"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Signs out, drops the signed-in user's cached data (so the navbar can't show it any
 * more), and goes back to the explore page as a guest.
 */
export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed", error);
      return;
    }
    queryClient.removeQueries({ queryKey: ["current-user"] });
    queryClient.removeQueries({ queryKey: ["notifications"] });
    router.push("/");
    // The layouts re-read the (now missing) session cookie.
    router.refresh();
  };
}
