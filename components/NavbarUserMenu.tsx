"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "lucide-react";
import { AccountMenuPanel } from "@/components/AccountMenuPanel";

const TRI_GRADIENT =
  "linear-gradient(135deg, #6b41ff 0%, #ea4bff 50%, #ff6b00 100%)";
const AVATAR_GRADIENT =
  "linear-gradient(135deg, #ea4bff 0%, #2fcefd 55%, #ff6b00 100%)";

const CLOSE_DELAY = 120;

/** Navbar actions shown to a signed-in user: credits pill + account menu. */
export function NavbarUserMenu({ user }: { user: any }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
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
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/onboard");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      <Link
        className="hidden sm:block"
        href={
          user?.subscription?.name === "Free Plan"
            ? "/subscription-plans"
            : "/my-subscription"
        }
      >
        {/* Tri-color gradient border pill */}
        <div
          className="animate-tri-glow p-[1.5px] rounded-full transition-all duration-300 hover:scale-[1.03]"
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

      {/* The panel lives inside this wrapper, so moving onto it never fires
          onMouseLeave and the mt-2 gap needs no bridging element. */}
      <div
        className="relative ml-2 sm:ml-4"
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
          {/* Wide outer glow */}
          <div
            className="absolute -inset-4 rounded-full blur-2xl opacity-70 group-hover/avatar:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: AVATAR_GRADIENT }}
          />
          {/* Tight inner glow */}
          <div
            className="absolute -inset-1 rounded-full blur-md opacity-90 group-hover/avatar:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: AVATAR_GRADIENT }}
          />
          {/* Thick gradient border ring */}
          <div
            className="relative rounded-full p-[2px]"
            style={{ background: AVATAR_GRADIENT }}
          >
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-neutral-900">
              <User
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                style={{
                  color: "#ea4bff",
                  filter:
                    "drop-shadow(0 0 5px #ea4bff) drop-shadow(0 0 10px #2fcefd)",
                }}
              />
            </div>
          </div>
        </button>

        {isOpen && (
          <AccountMenuPanel
            user={user}
            onNavigate={close}
            onSignOut={handleLogout}
          />
        )}
      </div>
    </>
  );
}
