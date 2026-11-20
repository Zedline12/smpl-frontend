// features/auth/components/GlobalLoginModal.tsx
"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { LoginModal } from "@/features/auth/components/LoginModal";

export function GlobalLoginModal() {
  const { isLoginModalOpen, authModalMode, closeLoginModal } = useAuthStore();

  return (
    <LoginModal
      isOpen={isLoginModalOpen}
      mode={authModalMode}
      onClose={() => closeLoginModal()}
    />
  );
}
