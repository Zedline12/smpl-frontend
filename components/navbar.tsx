"use client";
import Link from "next/link";
import Image from "next/image";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { MediaTypeLauncher } from "@/features/generation/components/navbar/MediaTypeLauncher";
import { StudioLinks } from "@/components/StudioLinks";
import { NavbarUserMenu } from "@/components/NavbarUserMenu";
import { NavbarGuestActions } from "@/components/NavbarGuestActions";

export function Navbar() {
  const { user, isAuthenticated } = useCurrentUser();

  return (
    <header
      id="tour-navbar"
      className="h-14 backdrop-blur-sm  flex items-center justify-between px-4 sm:px-8 "
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="shrink-0">
          {/* The source is 1000x1000 — the className is what actually caps it. */}
          <Image
            className="h-10 w-20 cursor-pointer"
            src="/logo.png"
            alt="Logo"
            width={150}
            height={100}
          />
        </Link>

        <MediaTypeLauncher />

        {/* bg-foreground/20 rather than bg-border: reads lighter on the dark
            theme and darker on the light one, from a single class. */}
        <span className="bg-foreground/20 hidden h-5 w-px md:block" />

        <StudioLinks />
      </div>

      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <NavbarUserMenu user={user} />
        ) : (
          <NavbarGuestActions />
        )}
      </div>
    </header>
  );
}
