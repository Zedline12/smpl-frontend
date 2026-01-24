import { SignInForm } from "@/features/auth/components/sign-in-form";
import { LoginForm } from "@/features/auth/forms/LoginForm";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm></LoginForm>
    </Suspense>
  );
}
