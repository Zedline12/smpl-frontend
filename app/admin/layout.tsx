import React from "react";
import { AdminNavbar } from "@/features/admin/components/AdminNavbar";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-blue-500/30">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="space-y-8 max-w-7xl mx-auto flex-1 p-6 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
