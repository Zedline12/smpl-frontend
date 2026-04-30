import { SignUpForm } from "@/features/auth/forms/SignupForm";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
