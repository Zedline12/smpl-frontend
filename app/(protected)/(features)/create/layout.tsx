"use client";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
export default function CreateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
      <div className="bg-background h-screen grid grid-rows-[auto_1fr] grid-cols-1 sm:grid-cols-[70px_1fr] xl:grid-cols-[230px_1fr]">
          {/* NAVBAR */}
          <header className="col-span-full z-50  ">
            <Navbar />
          </header>
    
          {/* SIDEBAR (desktop) */}
          <div className="hidden z-50  sm:block row-start-2 col-start-1 h-full">
            <Sidebar />
          </div>
          {/* SIDEBAR (mobile) */}
         
          {/* CONTENT */}
          <main className="row-start-2 h-full col-start-1 sm:col-start-2  ">
            {children}
          </main>
          </div>
  );
}
