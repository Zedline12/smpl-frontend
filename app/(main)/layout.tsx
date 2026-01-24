import { WorkspaceNavbar } from "@/components/navbar";
import { WorkspaceSidebar } from "@/components/sidebar";
import { User } from "@/features/user/types/user";
import { fetchWithToken } from "@/lib/fetcher";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = (await fetchWithToken("/users/me")
    .then((res) => res.json())
    .then((data) => data.data)) as User;
  console.log(user);
  return (
    <div className="bg-dark min-h-screen grid grid-cols-[260px_1fr] grid-rows-[auto_1fr]">
      {/* LEFT SIDEBAR spans both rows */}
      <aside className="row-span-2 border-r border-muted">
        <WorkspaceSidebar />
      </aside>

      {/* TOP NAVBAR */}
      <header >
        <WorkspaceNavbar user={user} />
      </header>

      {/* MAIN CONTENT */}
      <main className="overflow-y-auto ">{children}</main>
    </div>
  );
}
