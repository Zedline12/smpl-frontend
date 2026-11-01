import { Navbar } from "@/components/navbar";

export default function AiInfluencerStudioLayout({
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

      {/* CONTENT — no app sidebar; the studio owns the full width */}
      <main className="row-start-2 min-h-0 px-4 pb-4 pt-3 lg:px-6">{children}</main>
    </div>
  );
}
