import { cookies } from "next/headers";
import AuthProvider from "@/providers/AuthProvider";
import { Navbar } from "@/components/navbar";
import { fetchWithToken } from "@/lib/fetcher";
import Footer from "@/components/footer";

/** Full-width public pages (navbar + footer, no sidebar), e.g. /pricing. */
export default async function StandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("token")?.value;

  // Same as the public layout: the navbar's credits pill and account menu read the subscription.
  const user = token
    ? await fetchWithToken("/auth/me?include=subscription")
        .then((res) => res.json())
        .then((json) => json?.data ?? null)
        .catch(() => null)
    : null;

  return (
    <AuthProvider user={user}>
      <div className="bg-background h-screen grid grid-rows-[auto_1fr] grid-cols-1">
        <header className="col-span-full z-[60]">
          <Navbar />
        </header>
        <main className="row-start-2 h-full overflow-y-auto flex flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </main>
      </div>
    </AuthProvider>
  );
}
