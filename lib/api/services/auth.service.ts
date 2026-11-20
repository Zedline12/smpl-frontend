import { apiFetch } from "@/lib/api/client";
import {
  LoginRequest,
  AuthResponse,
  ResetPasswordRequest,
} from "@/lib/types/auth";

export const authService = {
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiFetch("auth/email/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<void> {
    await apiFetch("auth/logout", {
      method: "POST",
    });
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    return await apiFetch("auth/email/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async checkAuth(): Promise<boolean> {
    try {
      await apiFetch("auth/is-auth", {
        method: "POST",
      });
      return true;
    } catch (error) {
      return false;
    }
  },
};
