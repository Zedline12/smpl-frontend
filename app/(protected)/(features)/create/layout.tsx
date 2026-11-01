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

  return (
    <div className="bg-background h-screen grid grid-rows-[auto_1fr] grid-cols-1 sm:grid-cols-[300px_1fr]">
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
