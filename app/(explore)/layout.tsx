import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthProvider from "@/providers/AuthProvider";
import { MainShell } from "@/components/MainShell";
import AiAssistantWidget from "@/features/chat/components/AiAssistantWidget";
import { fetchWithToken } from "@/lib/fetcher";

/**
 * The public explore page (`/`): open to guests, with the signed-in user when there is
 * one. The navbar shows Pricing / Sign in / Sign up or the account controls from that.
 */
export default async function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // `include=subscription` matches the protected layout: the credits pill and the
  // account menu both read it.
  const user = token
    ? await fetchWithToken("/auth/me?include=subscription")
        .then((res) => res.json())
        .then((json) => json?.data ?? null)
        .catch(() => null)
    : null;

  if (user?.isSuspended) {
    redirect("/suspended");
  }

  return (
    <AuthProvider user={user}>
      <MainShell>{children}</MainShell>
      {user && <AiAssistantWidget />}
    </AuthProvider>
  );
}
