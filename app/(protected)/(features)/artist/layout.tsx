import { Navbar } from "@/components/navbar";

export default function ArtistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background grid h-screen grid-rows-[auto_1fr]">
      <header className="z-[60] mb-3">
        <Navbar />
      </header>
      <main className="row-start-2 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
