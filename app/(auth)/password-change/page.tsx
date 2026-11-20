"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { authService } from "@/lib/api/services/auth.service";
import Link from "next/link";
import { Loader2 } from "lucide-react";

function PasswordChangeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setErrorMessage("Invalid or missing reset token.");
      setSubmitStatus("error");
      return;
    }

    if (!isPasswordValid) return;

    setIsLoading(true);
    setErrorMessage("");
    setSubmitStatus("idle");

    try {
      await authService.resetPassword({
        token,
        password,
      });
      setSubmitStatus("success");
      // Back to sign in after a short delay
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        "Failed to reset password. The link may have expired or is invalid.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center">
        <p className="font-medium">Missing Reset Token</p>
        <p className="text-sm mt-1">
          Please use the link provided in your email to reset your password.
        </p>
        <Link
          href="/sign-in"
          className="text-sm text-blue-600 hover:underline mt-4 inline-block"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            Reset Password
          </h1>
          <p className="text-gray-500 mt-2">
            Create a strong password for your account
          </p>
        </div>

        {submitStatus === "success" ? (
          <div className="text-center space-y-4 animate-fade-in-up">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <div className="w-8 h-8 text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Password Reset Successfully
            </h3>
            <p className="text-gray-500">
              Your password has been updated. Taking you to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitStatus === "error" && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-fade-in-up">
                {errorMessage}
              </div>
            )}

            <PasswordInput
              value={password}
              onChange={setPassword}
              onValidationChange={setIsPasswordValid}
            />

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Resetting Password...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function PasswordChangePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <PasswordChangeContent />
    </Suspense>
  );
}
