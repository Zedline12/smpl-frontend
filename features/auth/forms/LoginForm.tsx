"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authLoginSchema } from "@/features/auth/schemas/auth.schema";
import { login } from "@/features/auth/actions/auth";
import { useToast } from "@/hooks/use-toast";
import { GoogleLoginButton } from "../components/google-login-button";
import { useSearchParams } from "next/navigation";
import { SocialAuthErrorText } from "../components/SocialAuthErrorText";
import Link from "next/link";
import { useState } from "react";

export function LoginForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const queryError = searchParams?.get("error");
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof authLoginSchema>>({
    resolver: zodResolver(authLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof authLoginSchema>) {
    setServerError(null);
    const data = await login(values);

    if (data?.message) {
      if (data.error) {
        setServerError(data.message);
      } else {
        toast({ title: "Success", description: data.message });
      }
    }
  }

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
        Welcome back
      </h1>
      <p
        className="text-[13px] mb-[30px]"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Sign in to your account to continue creating.
      </p>

      {/* Error */}
      {(serverError || queryError) && (
        <div className="mb-5 p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium animate-fade-in-up">
          <SocialAuthErrorText error={serverError || queryError || ""} />
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3.5"
        >
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="gap-1.5">
                <FormLabel
                  className="block"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: "0.03em",
                  }}
                >
                  Email address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{
                        width: 15,
                        height: 15,
                        color: "rgba(255,255,255,0.3)",
                      }}
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
                      className={
                        form.formState.errors.email
                          ? "pl-9 border-destructive"
                          : "pl-4"
                      }
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="gap-1.5">
                <FormLabel
                  className="block"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: "0.03em",
                  }}
                >
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{
                        width: 15,
                        height: 15,
                        color: "rgba(255,255,255,0.3)",
                      }}
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
                      placeholder="••••••••"
                      autoComplete="current-password"
                      style={{ paddingLeft: 35 }}
                      className={
                        form.formState.errors.password
                          ? "pl-9 border-destructive"
                          : "pl-9"
                      }
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Forgot password */}
          {/* <div className="flex justify-end -mt-1">
            <Link
              href="/forgot-password"
              className="text-[12px]  duration-150 hover:text-[#9370ff] text-[rgba(255,255,255,0.4)]"
            >
              Forgot password?
            </Link>
          </div> */}

          {/* Submit */}
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full mt-1 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden transition-all duration-200 hover:opacity-90 hover:-translate-y-px active:scale-[0.98]"
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
            {form.formState.isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </Form>

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

      {/* Sign up */}
      <p
        className="text-center mt-7"
        style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold hover:text-[#b89dff] transition-colors duration-150"
          style={{ color: "#9370ff", textDecoration: "none" }}
        >
          Get Started — it&apos;s free
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
