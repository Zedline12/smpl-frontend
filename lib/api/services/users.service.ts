import { apiFetch } from "../client";
import { User } from "@/lib/types/user.type";

export const UserService = {
  getCurrentUser: async (): Promise<User> => {
    return await fetch("/api/auth/me", { credentials: "include" }).then((res) => res.json().then((data) => data.data) );
  },
};
