"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";

interface Pending {
  slug: string;
  title: string;
  version: number;
  summaryOfChanges: string;
}

/**
 * A new version of the Terms (or another document) that must be accepted: blocks the app
 * until the user accepts or signs out. Mount only for signed-in users.
 */
export function ReacceptModal() {
  const [pending, setPending] = useState<Pending[]>([]);
  const [busy, setBusy] = useState(false);
  const signOut = useSignOut();

  useEffect(() => {
    let alive = true;
    fetch("/api/me/legal/pending", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const list = (j?.data ?? j)?.pending;
        if (alive && Array.isArray(list)) setPending(list);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  if (!pending.length) return null;

  const accept = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/me/legal/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: pending.map((p) => p.slug) }),
      });
      if (res.ok) setPending([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogPrimitive.Root open>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm" />
        <DialogPrimitive.Content
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl outline-none"
        >
          <DialogPrimitive.Title className="text-lg font-semibold text-white">We updated our terms</DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-sm text-white/55">
            Please review and accept to keep using smpl.
          </DialogPrimitive.Description>
          <ul className="mt-4 flex flex-col gap-2.5">
            {pending.map((p) => (
              <li key={p.slug} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <Link href={`/legal/${p.slug}`} target="_blank" className="text-sm font-medium text-white underline">
                  {p.title} (version {p.version})
                </Link>
                {p.summaryOfChanges && <p className="mt-1 text-[13px] leading-relaxed text-white/60">{p.summaryOfChanges}</p>}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => signOut()} className="h-10 rounded-lg border border-white/10 px-4 text-sm text-white/70 hover:bg-white/5">
              Sign out
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={accept}
              className="bg-primary hover:bg-primary/90 h-10 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              I accept
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
