"use client";

import { useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ShieldCheck } from "lucide-react";
import { RIGHTS_TEXT, useRightsPrompt } from "./rights";

/** Asks once per tool type: "I have the rights and consent". Mounted in the app layouts. */
export function RightsDialog() {
  const { features, resolve, close } = useRightsPrompt();
  const [checked, setChecked] = useState(false);
  const open = !!resolve && features.length > 0;

  const done = (ok: boolean) => {
    setChecked(false);
    close(ok);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && done(false)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl outline-none">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.06]">
              <ShieldCheck className="size-5 text-white/80" />
            </div>
            <DialogPrimitive.Title className="text-lg font-semibold text-white">Before you continue</DialogPrimitive.Title>
          </div>
          <DialogPrimitive.Description asChild>
            <div className="flex flex-col gap-3">
              {features.map((f) => (
                <div key={f} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-sm font-medium text-white">{RIGHTS_TEXT[f].title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/60">{RIGHTS_TEXT[f].text}</p>
                </div>
              ))}
            </div>
          </DialogPrimitive.Description>
          <label className="mt-4 flex items-start gap-2.5 text-[13px] text-white/80">
            <input type="checkbox" className="mt-0.5" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            <span>
              I confirm the above. I understand misuse breaks the{" "}
              <Link href="/legal/acceptable-use" target="_blank" className="underline">
                Acceptable Use Policy
              </Link>{" "}
              and can lead to my account being closed.
            </span>
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => done(false)} className="h-10 rounded-lg border border-white/10 px-4 text-sm text-white/70 hover:bg-white/5">
              Cancel
            </button>
            <button
              type="button"
              disabled={!checked}
              onClick={() => done(true)}
              className="bg-primary hover:bg-primary/90 h-10 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-40"
            >
              Confirm and continue
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
