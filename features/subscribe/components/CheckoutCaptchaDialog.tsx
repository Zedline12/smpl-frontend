"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TurnstileWidget } from "@/features/auth/components/TurnstileWidget";

interface CheckoutCaptchaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: (token: string) => void;
  /** True once a token has been verified and checkout has been kicked off. */
  isRedirecting: boolean;
}

export function CheckoutCaptchaDialog({
  open,
  onOpenChange,
  onVerified,
  isRedirecting,
}: CheckoutCaptchaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm rounded-2xl border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Quick check before checkout
          </DialogTitle>
          <DialogDescription>
            Confirming you&apos;re human before sending you to secure checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[80px] flex-col items-center justify-center gap-3 py-2">
          {isRedirecting ? (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Redirecting to checkout…
            </div>
          ) : (
            <TurnstileWidget onVerify={onVerified} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
