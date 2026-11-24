"use client";
import { useQuery } from "@tanstack/react-query";

export interface SignupGift {
  credits: number;
  provider: string;
}

/** The credits new Google sign-ups get right now (admin → Gifts), or null. */
export function useSignupGift(enabled = true): SignupGift | null {
  const { data } = useQuery({
    queryKey: ["signup-gift"],
    queryFn: async () => {
      const res = await fetch("/api/gifts/active");
      if (!res.ok) return null;
      const json = (await res.json().catch(() => null)) as { gift?: SignupGift | null } | null;
      return json?.gift ?? null;
    },
    enabled,
    staleTime: 60_000,
  });
  return data ?? null;
}
