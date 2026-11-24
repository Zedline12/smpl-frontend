"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { fetchCurrentBroadcast, markBroadcastSeen, sendBroadcastAction } from "../api";
import type { PublicBroadcast } from "../types";
import { BroadcastCard } from "./BroadcastCard";

/** Pages where a popup would get in the way. */
const QUIET_PATHS = [/^\/admin/, /^\/checkout/, /^\/sign-(in|up)/, /^\/billing\/(success|cancel)/, /^\/suspended/];
const DELAY_MS = 1500;

/**
 * The live announcement for the signed-in user, once: it's marked seen when it opens,
 * so it never shows again, then closing or clicking is recorded for the stats.
 * Mount only for signed-in users.
 */
export function BroadcastModal() {
  const pathname = usePathname();
  const router = useRouter();
  const [broadcast, setBroadcast] = useState<PublicBroadcast | null>(null);
  const [open, setOpen] = useState(false);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    if (QUIET_PATHS.some((re) => re.test(pathname))) return;
    // Let the first-visit home tour finish first.
    try {
      if (pathname === "/" && localStorage.getItem("homeTourDone") !== "true") return;
    } catch {
      /* storage blocked: go ahead */
    }
    checked.current = true;
    const timer = setTimeout(async () => {
      const next = await fetchCurrentBroadcast();
      if (!next) return;
      setBroadcast(next);
      setOpen(true);
      markBroadcastSeen(next.id);
    }, DELAY_MS);
    return () => {
      clearTimeout(timer);
      checked.current = false;
    };
  }, [pathname]);

  if (!broadcast) return null;

  const close = () => {
    if (!open) return;
    setOpen(false);
    sendBroadcastAction(broadcast.id, "closed");
  };

  const click = (index: number) => {
    const button = broadcast.design.buttons[index];
    setOpen(false);
    sendBroadcastAction(broadcast.id, "clicked", index);
    if (!button) return;
    if (button.newTab || /^https:\/\//i.test(button.href)) {
      window.open(button.href, button.newTab ? "_blank" : "_self", "noopener,noreferrer");
    } else {
      router.push(button.href);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4 outline-none"
          onClick={(e) => {
            // A click on the backdrop area around the card closes it.
            if (e.target === e.currentTarget) close();
          }}
        >
          <DialogPrimitive.Title className="sr-only">{broadcast.design.title}</DialogPrimitive.Title>
          <BroadcastCard design={broadcast.design} onButton={click} onClose={close} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
