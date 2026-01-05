import { WorkspaceNavbar } from "@/components/navbar";
import { WorkspaceSidebar } from "@/components/sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* FULL-WIDTH NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-white shadow">
        <WorkspaceNavbar />
      </header>

      {/* BELOW NAVBAR */}
      <div className="flex flex-1">
        {/* SIDEBAR */}
        <WorkspaceSidebar />

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
