import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminNavbar } from "@/features/admin/components/AdminNavbar";
import { fetchWithToken } from "@/lib/fetcher";

/** Full-width admin pages (Smpl Brain): the admin navbar, no sidebar. */
export default async function AdminFocusLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.get("token")?.value) redirect("/admin/login");

  const res = await fetchWithToken("/auth/admin/me");
  if (!res.ok) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-background text-white selection:bg-blue-500/30">
      <AdminNavbar />
      <main>{children}</main>
    </div>
  );
}
