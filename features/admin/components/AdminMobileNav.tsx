"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { AdminNavMenu } from "./AdminSidebar";

/** Phones: a menu button in the navbar that opens the admin menu as a drawer. */
export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-white/80 hover:bg-white/5 md:hidden"
        >
          <Menu className="size-5" />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm md:hidden" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left fixed inset-y-0 left-0 z-[70] flex w-[min(18rem,85vw)] flex-col overflow-y-auto border-r border-white/10 bg-[#0c0c0c] outline-none md:hidden"
        >
          <DialogPrimitive.Title className="sr-only">Admin menu</DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label="Close menu"
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/5"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
          <AdminNavMenu onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
