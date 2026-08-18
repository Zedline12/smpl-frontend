import { Navbar } from "@/components/navbar";

export default function PromptMakerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background grid h-screen grid-rows-[auto_1fr]">
      {/* NAVBAR */}
      <header className="z-50">
        <Navbar />
      </header>

      {/* CONTENT — no sidebar, the workspace gets the full width */}
      <main className="row-start-2 min-h-0">{children}</main>
    </div>
  );
}
