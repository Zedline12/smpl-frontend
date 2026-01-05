"use client";
import Image from 'next/image'
import { useUser } from "@/hooks/use-user";

export function WorkspaceNavbar() {
  const { user, isLoading } = useUser();


  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 ">
      <Image
        src="/logo-black.png"
        width={100}
        height={100}
        alt="Picture of the author"
      />

      <div className="flex items-center gap-6">
        {user && (
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 leading-none">
                {user.walletBalance}
              </span>
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider leading-none mt-1">
                {user.plan} Plan
              </span>
            </div>
          </div>
        )}

   

        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user
                ? `${user.firstName || ""} ${user.lastName || ""}`
                : "Loading..."}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[150px]">
              {user?.email || ""}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
            {user?.firstName?.charAt(0) || "U"}
            {user?.lastName?.charAt(0) || "N"}
          </div>
        </div>
      </div>
    </header>
  );
}
