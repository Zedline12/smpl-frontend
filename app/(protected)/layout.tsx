import { Navbar } from "@/components/navbar";
import AiAssistantWidget from "@/features/chat/components/AiAssistantWidget";
import { BroadcastModal } from "@/features/broadcasts/components/BroadcastModal";
import { ReacceptModal } from "@/features/legal/ReacceptModal";
import { RightsDialog } from "@/features/legal/RightsDialog";
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
    redirect("/sign-in");
  }

  const res = await fetchWithToken("/auth/me?include=subscription");
  const json = await res.json();
  const user = json.data;
  if (!user) {
    redirect("/sign-in");
  }
  if (user.isSuspended) {
    redirect("/suspended");
  }
  return (
    <AuthProvider user={user}>
      {children}
      <AiAssistantWidget />
      <BroadcastModal />
      <ReacceptModal />
      <RightsDialog />
    </AuthProvider>
  );
}
