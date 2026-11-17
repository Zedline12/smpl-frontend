import { Navbar } from "@/components/navbar";

export default function ArtistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // grid-cols-1 caps the column at the screen width; without it the navbar's
    // scrolling link row stretches the page to its full length on phones.
    <div className="bg-background grid h-screen grid-cols-1 grid-rows-[auto_1fr]">
      <header className="z-[60] mb-3 min-w-0">
        <Navbar />
      </header>
      <main className="row-start-2 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
