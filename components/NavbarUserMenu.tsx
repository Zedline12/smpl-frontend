"use client";

import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { Settings, User } from "lucide-react";
import { Menu, MenuItem } from "@/components/menu";

const TRI_GRADIENT =
  "linear-gradient(135deg, #6b41ff 0%, #ea4bff 50%, #ff6b00 100%)";
const AVATAR_GRADIENT =
  "linear-gradient(135deg, #ea4bff 0%, #2fcefd 55%, #ff6b00 100%)";

/** Navbar actions shown to a signed-in user: credits pill + account menu. */
export function NavbarUserMenu({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = async () => {
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
          user.subscription.name === "Free Plan"
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
              {user.creditsBalance}
            </span>

            <div
              className="w-px h-4 rounded-full"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />

            <span
              className="text-sm font-medium leading-none"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {user.subscription.name}
            </span>
          </div>
        </div>
      </Link>

      <Menu
        direction="down"
        align="right"
        trigger={
          <div className="relative cursor-pointer group/avatar">
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
          </div>
        }
        className="ml-2 sm:ml-4"
        menuClassName="bg-white dark:bg-black p-2 min-w-[150px]"
      >
        <MenuItem
          className="mb-3 text-white  justify-center text-center font-semibold rounded-md"
          onClick={() => redirect("/settings/account")}
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-300" />
        </MenuItem>
        <MenuItem
          className="bg-red-500 text-white hover:bg-red-600 hover:text-white justify-center text-center font-semibold rounded-md"
          onClick={handleLogout}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
