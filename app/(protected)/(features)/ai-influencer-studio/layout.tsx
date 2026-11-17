import { Navbar } from "@/components/navbar";

export default function AiInfluencerStudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background grid h-dvh grid-cols-1 grid-rows-[auto_1fr]">
      {/* NAVBAR */}
      <header className="z-[60] min-w-0">
        <Navbar />
      </header>

      {/* CONTENT — no app sidebar; the studio owns the full width */}
      <main className="row-start-2 min-h-0 min-w-0 px-3 pb-3 pt-2 lg:px-6 lg:pb-4 lg:pt-3">{children}</main>
    </div>
  );
}
