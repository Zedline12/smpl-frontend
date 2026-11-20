"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import { Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Navbar actions shown to signed-out visitors. */
export function NavbarGuestActions() {
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      <Link href="/pricing">
        <Button
          variant="ghost"
          className="text-foreground/75 hover:text-foreground bg-foreground/10 hover:bg-foreground/15 gap-1.5 font-medium"
        >
          <Gem className="size-4" />
          Pricing
        </Button>
      </Link>

      <Button
        variant="ghost"
        onClick={() => openLoginModal("sign-in")}
        className="text-secondary hover:text-secondary hover:bg-secondary/10 border-secondary/40 border bg-transparent font-semibold"
      >
        Sign In
      </Button>

      <Button
        onClick={() => openLoginModal("sign-up")}
        className="bg-secondary hover:bg-secondary/90 font-semibold text-white"
      >
        Sign Up
      </Button>
    </div>
  );
}
