import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";
import { SuspendedNotice } from "@/features/auth/components/SuspendedNotice";

export const metadata = { title: "Account suspended" };

export default async function SuspendedPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const suspendedToken = cookieStore.get("suspended_token")?.value;

  // Logged-in user: only show this page if they really are suspended.
  if (token) {
    const res = await fetchWithToken("/auth/me");
    const user = res.ok ? (await res.json())?.data : null;
    if (user?.isSuspended) return <SuspendedNotice email={user.email} />;
    if (user) redirect("/");
  }

  // Signed in to a suspended account (email or Google): support-only session.
  if (suspendedToken) return <SuspendedNotice />;

  redirect("/login");
}
