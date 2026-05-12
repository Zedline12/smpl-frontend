import { Navbar } from "@/components/navbar";

export default function OtherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background h-screen flex flex-col">
      <header className="z-50 flex-shrink-0">
        <Navbar />
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
