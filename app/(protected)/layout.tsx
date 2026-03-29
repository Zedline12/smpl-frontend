import { Navbar } from "@/components/navbar";
import { fetchWithToken } from "@/lib/fetcher";
import AuthProvider from "@/providers/AuthProvider";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    redirect("/login");
  }

  const res = await fetchWithToken("/auth/me?include=subscription");
  const json = await res.json();
  const user = json.data;
  if (!user) {
    redirect("/login");
  }
  return <AuthProvider user={user}>{children}</AuthProvider>;
}
