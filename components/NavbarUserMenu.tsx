"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import { UserAvatar, useCreditsRemaining } from "@/components/UserAvatar";
import { AccountMenuPanel } from "@/components/AccountMenuPanel";
import { SupportModal } from "@/features/support/components/SupportModal";
import { isFreePlan } from "@/lib/subscription";

const TRI_GRADIENT =
  "linear-gradient(135deg, #6b41ff 0%, #ea4bff 50%, #ff6b00 100%)";

const CLOSE_DELAY = 120;

/** The signed-in user's avatar (with the credits-left ring) and account menu. */
export function NavbarUserMenu({ user }: { user: any }) {
  const pathname = usePathname();
  const signOut = useSignOut();
  const creditsLeft = useCreditsRemaining(user);

  const [isOpen, setIsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const open = () => {
    clearCloseTimer();
    setIsOpen(true);
  };

  const close = () => {
    clearCloseTimer();
    setIsOpen(false);
  };

  // Delayed so the pointer can cross the gap between the avatar and the panel.
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setIsOpen(false), CLOSE_DELAY);
  };

  useEffect(() => clearCloseTimer, []);

  // Never let the menu survive a navigation.
  useEffect(() => {
    clearCloseTimer();
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const handleLogout = async () => {
    close();
    await signOut();
  };

  return (
    <>
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />

      {/* The panel lives inside this wrapper, so moving onto it never fires
          onMouseLeave and the mt-2 gap needs no bridging element. */}
      <div
        className="relative"
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
      >
        <button
          type="button"
          // Hover is additive: the click keeps the menu reachable on touch.
          onClick={() => setIsOpen((previous) => !previous)}
          onFocus={open}
          aria-label="Account menu"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          className="group/avatar relative block cursor-pointer"
        >
          {/* Thin primary ring = share of the plan's credits still left */}
          <UserAvatar
            user={user}
            size={28}
            progress={creditsLeft}
          />
          <span className="sr-only">
            {Math.round(creditsLeft * 100)}% of credits left
          </span>
        </button>

        {isOpen && (
          <AccountMenuPanel
            user={user}
            onNavigate={close}
            onSignOut={handleLogout}
            onSupport={() => {
              close();
              setSupportOpen(true);
            }}
          />
        )}
      </div>
    </>
  );
}

/**
 * Credits + plan pill, linking to pricing (free) or the subscription page.
 * `compact` (phones): credits only, a plain border instead of the glow, a primary icon.
 */
export function CreditsPill({
  user,
  className,
  compact = false,
}: {
  user: any;
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Link
        className={className}
        href={isFreePlan(user) ? "/pricing" : "/me/settings/subscription"}
        aria-label={`${user?.creditsBalance ?? 0} credits`}
      >
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-[#080808] py-1.5 pr-3.5 pl-1.5">
          <div className="bg-primary flex size-5 shrink-0 items-center justify-center rounded-full">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-3 text-white">
              <path
                fillRule="evenodd"
                d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-sm leading-none font-bold text-white tabular-nums">{user?.creditsBalance}</span>
        </div>
      </Link>
    );
  }
  return (
    <Link
      className={className}
      href={isFreePlan(user) ? "/pricing" : "/me/settings/subscription"}
    >
      {/* Tri-color gradient border pill */}
      <div
        className="p-[1.5px] rounded-full transition-transform duration-300 hover:scale-[1.03]"
        style={{ background: TRI_GRADIENT, backgroundSize: "200% 200%" }}
      >
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: "#080808" }}
        >
          {/* Lightning in tri-color gradient circle */}
          <div
            className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
            style={{ background: TRI_GRADIENT }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3 h-3 text-white"
            >
              <path
                fillRule="evenodd"
                d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <span className="text-sm font-bold text-white leading-none">
            {user?.creditsBalance}
          </span>

          <div
            className="w-px h-4 rounded-full"
            style={{ background: "rgba(255,255,255,0.2)" }}
          />

          <span
            className="text-sm font-medium leading-none"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {user?.subscription?.name}
          </span>
        </div>
      </div>
    </Link>
  );
}
