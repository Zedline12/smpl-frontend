import { LoginForm } from "@/features/auth/forms/LoginForm";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
