import { Navbar } from "@/components/navbar";
import { ClippingStudioNav } from "./_components/ClippingStudioNav";

export default function ClippingStudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background grid h-screen grid-rows-[auto_1fr]">
      {/* NAVBAR */}
      <header className="z-[60]">
        <Navbar />
      </header>

      {/* CONTENT — no app sidebar; the studio owns its own nav */}
      <main className="row-start-2 flex min-h-0 flex-col md:flex-row">
        <aside className="border-border shrink-0 border-b p-3 md:h-full md:w-52 md:border-r md:border-b-0">
          <p className="text-muted-foreground mb-2 hidden px-3 text-[11px] font-semibold tracking-widest uppercase md:block">
            Clipping Studio
          </p>
          <ClippingStudioNav />
        </aside>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
