import { UserService } from "@/lib/api/services/user.service";
import { User } from "@/lib/types/user.type";
import { useState, useEffect } from "react";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setIsLoading(true);
        const userData = await UserService.getCurrentUser();
        setUser(userData);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch user", err);
        setError(err.message || "Failed to load user");
        // Optional: toast.error("Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, isLoading, error };
}
