"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleLoginButton } from "../components/google-login-button";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSignupSchema } from "../schemas/auth.schema";
import { signup } from "../actions/auth";
import { z } from "zod";
import { Input } from "@/components/ui/input";

type SignupFormData = z.infer<typeof authSignupSchema>;

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: "rgba(255,255,255,0.5)",
  letterSpacing: "0.03em",
} as const;

const iconStyle = {
  width: 15,
  height: 15,
  color: "rgba(255,255,255,0.3)",
} as const;

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryError = searchParams?.get("error");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(authSignupSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const result = await signup(data);
      if (result?.error) {
        setServerError(result.message || "An error occurred during signup");
      } else {
        router.push("/signup/success");
      }
    } catch {
      setServerError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Heading */}
      <h1
        className="text-white mb-1.5"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 26,
          fontWeight: 900,
          letterSpacing: "-0.02em",
        }}
      >
        Create account
      </h1>
      <p
        className="text-[13px] mb-[30px]"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Start creating for free today.
      </p>

      {/* Error */}
      {(serverError || queryError) && (
        <div className="mb-5 p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium animate-fade-in-up">
          {serverError || queryError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
        {/* First + Last name */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>First name</label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={iconStyle}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <Input
                type="text"
                placeholder="John"
                autoComplete="given-name"
                style={{ paddingLeft: 35 }}
                className={
                  errors.firstName ? "pl-9 border-destructive" : "pl-9"
                }
                {...register("firstName")}
              />
            </div>
            {errors.firstName && (
              <p className="text-[11px] text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Last name</label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={iconStyle}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <Input
                type="text"
                placeholder="Doe"
                autoComplete="family-name"
                style={{ paddingLeft: 35 }}
                className={errors.lastName ? "pl-9 border-destructive" : "pl-9"}
                {...register("lastName")}
              />
            </div>
            {errors.lastName && (
              <p className="text-[11px] text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Email address</label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={iconStyle}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <Input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              style={{ paddingLeft: 35 }}
              className={errors.email ? "pl-9 border-destructive" : "pl-9"}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Password</label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={iconStyle}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <Input
              type="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              style={{ paddingLeft: 35 }}
              className={errors.password ? "pl-9 border-destructive" : "pl-9"}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-[11px] text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-1 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:opacity-90 hover:-translate-y-px active:scale-[0.98]"
          style={{
            padding: "12px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #6b41ff, #ea4bff)",
            color: "#fff",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.01em",
            boxShadow: "0 0 24px rgba(107,65,255,0.45)",
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin inline-block" />
              Creating account…
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* OR divider */}
      <div className="flex items-center gap-3 my-5">
        <div
          className="flex-1 h-px"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.05em",
          }}
        >
          or continue with
        </span>
        <div
          className="flex-1 h-px"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
      </div>

      {/* Google */}
      <GoogleLoginButton
        onClick={() => {
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/user`;
        }}
      />

      {/* Sign in link */}
      <p
        className="text-center mt-7"
        style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold hover:text-[#b89dff] transition-colors duration-150"
          style={{ color: "#9370ff", textDecoration: "none" }}
        >
          Sign in
        </Link>
      </p>

      {/* Terms */}
      <p
        className="text-center mt-5 leading-relaxed"
        style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}
      >
        By signing in, you agree to our{" "}
        <Link
          href="https://smplcontent.com/privacy-policy"
          style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
          className="hover:text-white/55 transition-colors"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
