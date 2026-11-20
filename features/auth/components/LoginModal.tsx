"use client";

import { Suspense } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { AuthModalMode } from "@/stores/useAuthStore";
import { AuthFlow } from "./AuthFlow";

interface LoginModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  mode?: AuthModalMode;
}

/** Sign in / sign up without leaving the page (the dialog brings its own close button). */
export function LoginModal({
  isOpen,
  onClose,
  mode = "sign-up",
}: LoginModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="custom-scrollbar flex h-dvh max-h-dvh w-full max-w-full flex-col justify-center gap-0 overflow-y-auto rounded-none border-0 bg-[#141416] px-6 py-12 sm:h-auto sm:max-h-[92vh] sm:max-w-[440px] sm:rounded-3xl sm:border sm:border-white/[0.08] sm:px-8 sm:pt-14 sm:pb-8">
        <DialogTitle className="sr-only">
          {mode === "sign-in" ? "Sign in" : "Sign up"}
        </DialogTitle>
        {/* A fresh flow each time it opens (back to the first step). */}
        {isOpen && (
          <Suspense fallback={null}>
            <AuthFlow
              key={mode}
              variant="modal"
              mode={mode}
              onSignedIn={() => onClose(false)}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
}
