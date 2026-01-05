import { apiFetch } from "@/lib/api/client";
import { LoginRequest, RegisterRequest, AuthResponse } from "@/lib/types/auth";

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return await apiFetch("auth/email/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return await apiFetch("auth/email/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
