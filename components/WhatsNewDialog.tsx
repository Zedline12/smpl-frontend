"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const VERSION_KEY = "whats-new-v1";

export function WhatsNewDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const key = `${VERSION_KEY}-${user.id}`;
    if (!localStorage.getItem(key)) {
      setOpen(true);
    }
  }, [user?.id]);

  const handleClose = () => {
    if (user?.id) localStorage.setItem(`${VERSION_KEY}-${user.id}`, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md w-full bg-neutral-900 border border-white/10 rounded-2xl p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">What's New</DialogTitle>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Update</p>
          <h2 className="text-xl font-bold text-white">What's New</h2>
        </div>

        {/* Feature cards */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Regenerate */}
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">Regenerate Previous Creations</p>
              <p className="text-xs text-white/50 leading-relaxed">
                Click any media card and hit Regenerate to instantly reload its model and settings into the composer.
              </p>
            </div>
          </div>

          {/* Seedream V4.5 */}
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">New Model: Seedream V4.5</p>
              <p className="text-xs text-white/50 leading-relaxed">
                A powerful new image model with reference image support and flexible aspect ratios including 1:1, 16:9, 9:16 and more.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
