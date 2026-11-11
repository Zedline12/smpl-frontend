import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";
import { clientIpHeader } from "@/lib/client-ip";

/** Checks a promotion code and returns each plan's discounted price. */
export async function POST(req: NextRequest) {
  try {
    const { code, planId } = await req.json();
    const response = await fetchWithToken("/payments/promotion-code/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...clientIpHeader(req.headers) },
      body: JSON.stringify({ code: String(code ?? "").slice(0, 64), ...(planId ? { planId } : {}) }),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        { error: json?.message || "Couldn't check this code.", code: json?.error?.code ?? null },
        { status: response.status },
      );
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Promotion code check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
