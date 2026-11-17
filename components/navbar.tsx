"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Images } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { MediaTypeLauncher } from "@/features/generation/components/navbar/MediaTypeLauncher";
import { StudioLinks } from "@/components/StudioLinks";
import { NavbarUserMenu } from "@/components/NavbarUserMenu";
import { NavbarGuestActions } from "@/components/NavbarGuestActions";
import { cn } from "@/lib/utils";
import { JobsIndicator } from "@/features/live/JobsIndicator";
import { NavbarSearch } from "@/features/search/components/NavbarSearch";
import { MobileNavActions } from "@/components/MobileNavMenu";

export function Navbar() {
  const { user, isAuthenticated } = useCurrentUser();
  const pathname = usePathname();
  const onAssets = pathname === "/assets" || pathname?.startsWith("/assets/");

  return (
    <>
    <header
      id="tour-navbar"
      className="flex h-14 items-center gap-3 px-3 backdrop-blur-sm sm:gap-4 sm:px-8"
    >
      <Link href="/" className="shrink-0">
        {/* The source is 1000x1000 — the className is what actually caps it. */}
        <Image
          className="h-7 w-[70px] cursor-pointer object-contain sm:h-8 sm:w-20"
            src="/logo.png"
          alt="Logo"
          width={200}
          height={100}
        />
      </Link>

      {/* Signed in on phones: everything here moves into the menu button. */}
      <nav className={cn("min-w-0 flex-1 items-center", isAuthenticated ? "hidden sm:flex" : "flex")} aria-label="Main">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden">
        <MediaTypeLauncher />

        {/* bg-foreground/20 rather than bg-border: reads lighter on the dark
            theme and darker on the light one, from a single class. */}
        <span className="bg-foreground/20 h-5 w-px shrink-0" />

        <StudioLinks />
      </div>
      </nav>

      {/* Phones, signed in: logo · Pricing (free) · credits/plan · menu button. */}
      {isAuthenticated && (
        <div className="ml-auto flex min-w-0 sm:hidden">
          <MobileNavActions user={user} />
        </div>
      )}

      <div className={cn("shrink-0 items-center gap-3 sm:gap-6", isAuthenticated ? "hidden sm:flex" : "flex")}>
        {isAuthenticated && <NavbarSearch />}

        {isAuthenticated && (
          <Link
            href="/assets"
            aria-label="Assets"
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium transition-colors",
              onAssets ? "text-[var(--purple-300)]" : "text-foreground/55 hover:text-foreground",
            )}
          >
            <Images className="size-5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Assets</span>
          </Link>
        )}

        {isAuthenticated && <JobsIndicator />}

        {isAuthenticated ? (
          <NavbarUserMenu user={user} />
        ) : (
          <NavbarGuestActions />
        )}
      </div>
    </header>
    </>
  );
}
