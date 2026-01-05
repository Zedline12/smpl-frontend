import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api/services/auth.service";
import { LoginRequest, RegisterRequest } from "@/lib/types/auth";

interface UseAuthReturn {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      console.log("Login successful", response);
      // In a real app, you might save the user info to context/redux here
      router.push("/workspace");
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      console.log("Registration successful", response);
      router.push("/onboard");
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return { login, register, isLoading, error };
}
