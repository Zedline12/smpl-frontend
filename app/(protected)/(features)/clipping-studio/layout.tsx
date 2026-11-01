import { Navbar } from "@/components/navbar";

export default function ClippingStudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background grid h-screen grid-rows-[auto_1fr]">
      <header className="z-[60]">
        <Navbar />
      </header>

      {/* No sidebar: the studio is one scrolling page. */}
      <main className="custom-scrollbar row-start-2 min-h-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
