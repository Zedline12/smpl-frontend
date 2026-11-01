"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { MediaTypeLauncher } from "@/features/generation/components/navbar/MediaTypeLauncher";
import { StudioLinks } from "@/components/StudioLinks";
import { NavbarUserMenu } from "@/components/NavbarUserMenu";
import { NavbarGuestActions } from "@/components/NavbarGuestActions";
import { SupportModal } from "@/features/support/components/SupportModal";

export function Navbar() {
  const { user, isAuthenticated } = useCurrentUser();
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
    <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    <header
      id="tour-navbar"
      className="h-14 backdrop-blur-sm  flex items-center justify-between px-4 sm:px-8 "
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="shrink-0">
          {/* The source is 1000x1000 — the className is what actually caps it. */}
          <Image
            className="h-10 w-25 cursor-pointer"
            src="/logo.png"
            alt="Logo"
            width={200}
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
        <button
          type="button"
          onClick={() => setSupportOpen(true)}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "rgba(255,255,255,0.55)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
          aria-label="Support"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
          <span className="hidden sm:inline">Support</span>
        </button>

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
