"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequestOtpForm } from "@/features/auth/components/RequestOtpForm";
import { VerifyOtpForm } from "@/features/auth/components/VerifyOtpForm";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import Link from "next/link";

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (step === "done") {
      const t = setTimeout(() => router.push("/login"), 2500);
      return () => clearTimeout(t);
    }
  }, [step, router]);

  return (
    <div>
      {step === "email" && (
        <RequestOtpForm
          onSuccess={(e) => {
            setEmail(e);
            setStep("otp");
          }}
        />
      )}

      {step === "otp" && (
        <VerifyOtpForm
          email={email}
          onSuccess={() => setStep("password")}
        />
      )}

      {step === "password" && (
        <ResetPasswordForm
          email={email}
          onSuccess={() => setStep("done")}
          onOtpExpired={() => setStep("otp")}
        />
      )}

      {step === "done" && (
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(107,65,255,0.15)", border: "1px solid rgba(107,65,255,0.3)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#9370ff" strokeWidth="2.2" className="w-6 h-6">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2
            className="text-white mb-2"
            style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800 }}
          >
            Password reset!
          </h2>
          <p className="text-[13px] mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Redirecting you to login…
          </p>
        </div>
      )}

      {step !== "done" && (
        <p className="text-center mt-7" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          Remember it?{" "}
          <Link
            href="/login"
            className="font-semibold hover:text-[#b89dff] transition-colors duration-150"
            style={{ color: "#9370ff", textDecoration: "none" }}
          >
            Back to login
          </Link>
        </p>
      )}
    </div>
  );
}
