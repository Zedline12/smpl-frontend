import Link from "next/link";
import { X } from "lucide-react";
import { AuthShowcase } from "./_components/AuthShowcase";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-[#141416]">
      {/* Videos: desktop only. */}
      <div className="hidden min-w-0 flex-1 p-3 md:block">
        <AuthShowcase />
      </div>

      <div className="relative flex flex-1 flex-col overflow-y-auto">
        <Link
          href="/"
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/[0.07] text-white/70 transition-colors hover:bg-white/[0.12] hover:text-white"
        >
          <X className="size-4" />
        </Link>
        <div
          className="m-auto w-full max-w-[380px] px-6 py-16"
          style={{ animation: "fadeUp 0.6s ease-out 0.1s both" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
