import { Navbar } from "@/components/navbar";
import { STUDIO_PANEL_CLASS } from "@/components/studio/StudioSidebar";
import { ClippingSidebar } from "@/features/clipping/components/ClippingSidebar";

export default function ClippingStudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Same shell as Ads Studio: navbar, the studio's sidebar, one content panel.
    <div className="bg-background grid h-screen grid-cols-1 grid-rows-[auto_1fr]">
      <header className="z-[60] min-w-0">
        <Navbar />
      </header>

      <main className="row-start-2 flex min-h-0 min-w-0 flex-col gap-2 px-3 pb-3 md:flex-row md:gap-3">
        <ClippingSidebar />
        <div className={STUDIO_PANEL_CLASS}>{children}</div>
      </main>
    </div>
  );
}
