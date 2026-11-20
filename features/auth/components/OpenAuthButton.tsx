"use client";

import type { ReactNode } from "react";
import { useAuthStore, type AuthModalMode } from "@/stores/useAuthStore";

/** A button that opens the sign-in / sign-up modal (for server components too). */
export function OpenAuthButton({
  mode = "sign-in",
  className,
  children,
  "aria-label": ariaLabel,
}: {
  mode?: AuthModalMode;
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
}) {
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  return (
    <button
      type="button"
      onClick={() => openLoginModal(mode)}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </button>
  );
}
