import { apiFetch } from "../client";
import { User } from "@/lib/types/user.type";

export const UserService = {
  getCurrentUser: async (): Promise<User> => {
    return apiFetch("users/me");
  },
};
