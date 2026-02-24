"use client";
import { useRouter } from "next/navigation";
import { DollarSignIcon, LogOut, SubscriptIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { logout } from "@/features/auth/actions/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "./ui/button";
import { Menu, MenuItem } from "@/components/menu";
import { useAuth } from "@/providers/AuthProvider";

export function Navbar() {
  const router = useRouter();
  const { user } = useAuth();
  const { openLoginModal } = useAuthStore();
  return (
    <header
      style={{ zIndex: 100 }}
      className="h-16 backdrop-blur-sm  flex items-center justify-between px-4 sm:px-8 "
    >
      <Image src="/logo.png" alt="Logo" width={100} height={100} />

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link  className="hidden sm:block" href={`${user.subscription.name == "Free Plan" ? "/subscription-plans" : "/my-subscription"}`} >
              <div className="grid grid-cols-2 gap-3 items-center px-3 py-1.5 rounded-full  border border-gray-200">
                <div className="flex flex-row items-center border-r-2 border-r-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="bg-red-500 size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                    />
                  </svg>
                  <span className="text-sm mx-2 font-bold text-foreground leading-none">
                    {user!.creditsBalance}
                  </span>
                </div>

                <div className="bg-black flex rounded-full items-center h-5 justify-center">
                  <span className="text-[10px] text-center text-white font-semibold ">
                    {user.subscription.name}
                  </span>
                </div>
              </div>
            </Link>

            <Menu
              className="pl-6 sm:border-l border-gray-100"
              trigger={
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm hover:shadow-md transition-shadow">
                  {user!.avatarUrl ? (
                    <Image
                      src={user!.avatarUrl}
                      alt=""
                      className="w-full h-full rounded-full"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm hover:shadow-md transition-shadow">
                      {user!.firstName?.charAt(0) || "U"}
                      {user!.lastName?.charAt(0) || "N"}
                    </div>
                  )}
                </div>
              }
              align="right"
            >
              {user.subscription.name != "Free Plan" && (
                <MenuItem
                  type="submit"
                  variant="default"
                  onClick={() => router.push("/my-subscription")}
                  icon={<DollarSignIcon className="h-4 w-4" />}
              >
                My Subscription
              </MenuItem>
              )}
              <MenuItem
                type="submit"
                variant="danger"
                onClick={logout}
                icon={<LogOut className="h-4 w-4" />}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
            <div className="flex items-center  sm:gap-4">
              <Link href="/login">
                <Button
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {" "}
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {" "}
                  Sign Up
                </Button>
              </Link>
            {/* <Button
              onClick={() => openLoginModal()}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {" "}
              Log In
            </Button>
            <Button
              onClick={() => openLoginModal()}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {" "}
              Sign Up
            </Button> */}
          </div>
        )}
      </div>
    </header>
  );
}
