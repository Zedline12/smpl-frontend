"use client";
import { authService } from "@/lib/api/services/auth.service";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { User } from "@/features/user/types/user";
import { logout } from "@/features/auth/actions/auth";
export function WorkspaceNavbar({ user }: { user: User }) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 backdrop-blur-sm  flex items-center justify-between px-8 ">
      <span className="text-2xl font-bold text-foreground">CREATE</span>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link href="/subscribe">
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
                    {user.creditsBalance}
                  </span>
                </div>

                <div className="bg-black flex rounded-full items-center h-5 justify-center">
                  <span className="text-[10px] text-center text-white font-semibold ">
                    {user.plan} Plan
                  </span>
                </div>
              </div>
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 pl-6 border-l border-gray-100 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm hover:shadow-md transition-shadow">
                  {user.firstName?.charAt(0) || "U"}
                  {user.lastName?.charAt(0) || "N"}
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
