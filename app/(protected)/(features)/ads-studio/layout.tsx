import { Navbar } from "@/components/navbar";
import { AdsStudioSidebar } from "@/features/ads-studio/components/AdsStudioSidebar";

export default function AdsStudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // grid-cols-1 keeps the column at the screen width, so the navbar's scrolling
    // link row can't stretch the page on phones.
    <div className="bg-background grid h-screen grid-cols-1 grid-rows-[auto_1fr]">
      <header className="z-[60] min-w-0">
        <Navbar />
      </header>

      <main className="row-start-2 flex min-h-0 min-w-0 flex-col gap-2 px-3 pb-3 md:flex-row md:gap-3">
        <AdsStudioSidebar />
        <div className="tw-fields custom-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          {children}
        </div>
      </main>
    </div>
  );
}
