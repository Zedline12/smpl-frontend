import { Suspense } from "react";
import { AuthFlow } from "@/features/auth/components/AuthFlow";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <AuthFlow variant="page" mode="sign-up" />
    </Suspense>
  );
}
