import Image from "next/image";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata = { title: "Access blocked" };

export default function BlockedPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, #ef4444 0%, #6b41ff 50%, transparent 70%)" }}
      />

      <div
        className="relative w-full max-w-[440px] rounded-3xl p-8 text-center"
        style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Image src="/logo.png" alt="Logo" width={200} height={100} className="mx-auto mb-8 h-10 w-25" />

        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <ShieldAlert className="h-8 w-8 text-red-400" />
        </div>

        <h1
          className="mb-2 text-white"
          style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em" }}
        >
          Access from your network is blocked
        </h1>
        <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          For security reasons we can&apos;t accept sign-ups, logins, or payments from your current
          network.
        </p>

        <ul
          className="mt-5 space-y-2 rounded-xl p-4 text-left text-[13px]"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
        >
          <li>• If you&apos;re using a VPN or proxy, turn it off and try again.</li>
          <li>• Try a different network, such as mobile data.</li>
          <li>• If you think this is a mistake, contact our support team.</li>
        </ul>

        <Link
          href="/"
          className="mt-7 flex w-full items-center justify-center rounded-xl py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
