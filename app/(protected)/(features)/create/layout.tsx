"use client";
import { Navbar } from "@/components/navbar";
import CreateSidebar from "@/features/generation/components/sidebar";

export default function CreateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="bg-background min-h-screen grid md:grid-cols-[100px_1fr] grid-cols-1 grid-rows-[auto_1fr]">
      {/* LEFT SIDEBAR spans both rows */}
      <aside className="md:block hidden row-span-2  ">
        {/* <CreateSidebar /> */}
      </aside>

       <Navbar></Navbar>
      <main className="overflow-y-auto   ">{children}</main>
    </div>
  );
}
