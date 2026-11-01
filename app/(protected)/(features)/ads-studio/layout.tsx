import { Navbar } from "@/components/navbar";

export default function AdsStudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background grid h-screen grid-rows-[auto_1fr]">
      <header className="z-[60]">
        <Navbar />
      </header>

      {/* Standalone studio: no app sidebar */}
      <main className="row-start-2 min-h-0">{children}</main>
    </div>
  );
}
