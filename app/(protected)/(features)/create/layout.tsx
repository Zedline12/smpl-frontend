"use client";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
// import { Sidebar } from "@/components/sidebar";
// import { CreateTabNav } from "@/components/CreateTabNav";
import { CreateSidebar } from "@/components/CreateSidebar";
import { usePathname } from "next/navigation";

export default function CreateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  // Motion-transfer has its own dedicated page — skip the tab nav & model sidebar there
  const isMotionTransfer = pathname.includes("/motion-transfer");
  // Image/Video on phones: the sidebar (90% of the screen) with Explore/History below it,
  // the whole page scrolling. Other create pages keep the sidebar desktop-only.
  const sidebarOnPhones = /^\/create\/(image|video)(\/|$)/.test(pathname);

  if (isMotionTransfer) {
    return (
      <div className="bg-background h-screen grid grid-rows-[auto_1fr]">
        <header className="col-span-full z-[60]">
          <Navbar />
        </header>
        <main className="h-full overflow-hidden">{children}</main>
      </div>
    );
  }

  if (sidebarOnPhones) {
    return (
      <div className="bg-background grid h-dvh grid-cols-1 grid-rows-[auto_auto_auto] overflow-y-auto sm:grid-cols-[minmax(280px,18%)_1fr] sm:grid-rows-[auto_1fr] sm:overflow-hidden">
        <header className="col-span-full z-[60] mb-3 min-w-0">
          <Navbar />
        </header>

        {/* Sidebar: 80% of the screen on phones (the top of Explore peeks out), the left column from sm. */}
        <div className="col-start-1 row-start-2 mx-3 h-[80dvh] min-w-0 overflow-hidden rounded-2xl border border-border sm:mx-0 sm:h-full sm:rounded-none sm:border-0">
          <Suspense>
            <CreateSidebar />
          </Suspense>
        </div>

        {/* Explore / History: below the sidebar on phones, growing with its content (min height). */}
        <main className="col-start-1 row-start-3 flex min-h-[70dvh] min-w-0 flex-col px-3 pt-3 pb-3 sm:col-start-2 sm:row-start-2 sm:block sm:h-full sm:min-h-0 sm:overflow-hidden sm:px-0 sm:pt-0 sm:pl-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background h-screen grid grid-rows-[auto_1fr] grid-cols-1 sm:grid-cols-[minmax(280px,18%)_1fr]">
      {/* NAVBAR */}
      <header className="col-span-full z-[60] mb-3">
        <Navbar />
      </header>

      {/* MODEL SIDEBAR (desktop) */}
      <div className="hidden sm:block row-start-2 col-start-1 h-full overflow-hidden">
        <Suspense>
          <CreateSidebar />
        </Suspense>
      </div>

      {/* CONTENT */}
      <main className="row-start-2 h-full col-start-1 sm:col-start-2 overflow-hidden sm:pl-4 pb-3">
        {children}
      </main>
    </div>
  );
}
