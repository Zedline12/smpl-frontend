"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startSuspendedSession } from "@/features/auth/actions/auth";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const exchangeToken = searchParams.get("exchange_token");
  const suspendedToken = searchParams.get("suspended_token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Google login for a suspended account: keep the support-only token and show /suspended.
    if (suspendedToken) {
      startSuspendedSession(suspendedToken)
        .then(() => router.replace("/suspended"))
        .catch(() => {
          setError("Authentication failed");
          setLoading(false);
        });
      return;
    }

    if (!exchangeToken) {
      setError("Missing exchange token");
      setLoading(false);
      return;
    }

    const exchange = async () => {
      try {
        const res = await fetch("/api/auth/exchange-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ exchangeToken }),
        });

        if (!res.ok) {
          throw new Error("Token exchange failed");
        }

        router.replace("/"); // 👈 better than push for auth
      } catch (err) {
        console.log(err);
        setError("Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    exchange();
  }, [exchangeToken, suspendedToken, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Authenticating…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return null;
}
