"use client";
import BottomNavbar from "@/components/BottomNavbar";
import { WorkspaceNavbar } from "@/components/navbar";
import { WorkspaceSidebar } from "@/components/sidebar";
import { useAuthBootstrap } from "@/features/auth/hooks/useAuthBootstrap";
import { User } from "@/features/user/types/user";
import { fetchWithToken } from "@/lib/fetcher";
const bottomNavbarItems = [
  {
    title: "Subscribe",
    link: "/subscription-plans",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
  },
];
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useAuthBootstrap();
  return (
    <div className="bg-background h-screen grid grid-rows-[auto_1fr] grid-cols-1 sm:grid-cols-[70px_1fr] xl:grid-cols-[230px_1fr]">
      {/* NAVBAR */}
      <header className="col-span-full z-50  ">
        <WorkspaceNavbar />
      </header>

      {/* SIDEBAR (desktop) */}
      <div className="hidden z-50  sm:block row-start-2 col-start-1 h-full">
        <WorkspaceSidebar />
      </div>
      {/* SIDEBAR (mobile) */}
      <div className=" row-start-2 col-start-1 h-full">
        <BottomNavbar items={bottomNavbarItems} />
      </div>
      {/* CONTENT */}
      <main className="row-start-2 h-full col-start-1 sm:col-start-2  ">
        {children}
      </main>
    </div>
  );
}
