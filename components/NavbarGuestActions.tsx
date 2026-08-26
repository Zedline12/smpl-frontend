"use client";

import Link from "next/link";
import { Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Navbar actions shown to signed-out visitors. */
export function NavbarGuestActions() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      <Link href="/subscription-plans">
        <Button
          variant="ghost"
          className="text-foreground/75 hover:text-foreground bg-foreground/10 hover:bg-foreground/15 gap-1.5 font-medium"
        >
          <Gem className="size-4" />
          Pricing
        </Button>
      </Link>

      <Link href="/login">
        <Button
          variant="ghost"
          className="text-secondary hover:text-secondary hover:bg-secondary/10 border-secondary/40 border bg-transparent font-semibold"
        >
          Log In
        </Button>
      </Link>

      <Link href="/signup">
        <Button className="bg-secondary hover:bg-secondary/90 font-semibold text-white">
          Sign Up
        </Button>
      </Link>
    </div>
  );
}
