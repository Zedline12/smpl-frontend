import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />

      {/* Abstract decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-200/20 blur-3xl animate-blob" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-200/20 blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 w-full">
         <Suspense fallback={<div>Loading...</div>}>
            <SignUpForm />
          </Suspense>
      </div>
    </div>
  );
}
