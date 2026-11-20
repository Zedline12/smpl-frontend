import { Suspense } from "react";
import { AuthFlow } from "@/features/auth/components/AuthFlow";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <AuthFlow variant="page" mode="sign-in" />
    </Suspense>
  );
}
