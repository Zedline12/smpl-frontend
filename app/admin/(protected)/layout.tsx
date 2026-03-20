import React from "react";
import { AdminNavbar } from "@/features/admin/components/AdminNavbar";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import { cookies } from "next/headers";
import { fetchWithToken } from "@/lib/fetcher";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    redirect("/admin/login");
  }

  const res = await fetchWithToken("/auth/admin/me");
  if (!res.ok) {
    redirect("/admin/login");
  }
  return (
    <div className="min-h-screen bg-background text-white selection:bg-blue-500/30">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="space-y-8 max-w-7xl mx-auto flex-1 p-6 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
