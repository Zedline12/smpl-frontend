"use client";
import { redirect, useRouter } from "next/navigation";
import {
  DollarSignIcon,
  LogOut,
  Settings,
  SubscriptIcon,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { logout } from "@/features/auth/actions/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "./ui/button";
import { Menu, MenuItem } from "@/components/menu";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/lib/api/services/users.service";

export function Navbar() {
  const router = useRouter();
  const { user: initialUser } = useAuth();
  const { openLoginModal } = useAuthStore();

  const { data: user = initialUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const updated = await UserService.getCurrentUser();
      return { ...initialUser, creditsBalance: updated.creditsBalance };
    },
  });
  return (
    <header
      style={{ zIndex: 100 }}
      className="h-16 backdrop-blur-sm  flex items-center justify-between px-4 sm:px-8 "
    >
      <Image src="/logo.png" alt="Logo" width={70} height={70} />

      <div className="flex items-center gap-6">
        {user ? (
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
                style={{
                  background:
                    "linear-gradient(135deg, #6b41ff 0%, #ea4bff 50%, #ff6b00 100%)",
                  backgroundSize: "200% 200%",
                }}
              >
                <div
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full"
                  style={{ background: "#080808" }}
                >
                  {/* Lightning in tri-color gradient circle */}
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #6b41ff, #ea4bff, #ff6b00)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-3.5 h-3.5 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {/* Credits */}
                  <span className="text-sm font-bold text-white leading-none">
                    {user.creditsBalance}
                  </span>

                  {/* Divider */}
                  <div
                    className="w-px h-4 rounded-full"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  />

                  {/* Plan name */}
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
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer border border-gray-200 dark:border-neutral-700">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-300" />
                </div>
              }
              className="ml-2 sm:ml-4"
              menuClassName="bg-white dark:bg-black p-2 min-w-[150px]"
            >
              <MenuItem
                className="mb-3 text-white  justify-center text-center font-semibold rounded-md"
                onClick={async () => {
                  redirect("/settings/account");
                }}
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-300" />
              </MenuItem>
              <MenuItem
                className="bg-red-500 text-white hover:bg-red-600 hover:text-white justify-center text-center font-semibold rounded-md"
                onClick={async () => {
                  try {
                    await fetch("/api/auth/logout", {
                      method: "POST",
                    });
                    router.push("/onboard");
                    router.refresh();
                  } catch (error) {
                    console.error("Logout failed", error);
                  }
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <div className="flex items-center  sm:gap-4">
            <Link href="/login">
              <Button className="text-sm font-medium text-gray-600 hover:text-gray-900">
                {" "}
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="text-sm font-medium text-gray-600 hover:text-gray-900">
                {" "}
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
