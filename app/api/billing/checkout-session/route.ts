import { unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";
import { clientIpHeader } from "@/lib/client-ip";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriptionPlanId, captchaToken, promotionCode, appliedVia } = body;

    const response = await fetchWithToken("/payments/checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...clientIpHeader(req.headers),
      },
      body: JSON.stringify({
        subscriptionPlanId,
        captchaToken,
        ...(promotionCode ? { promotionCode, appliedVia } : {}),
      }),
    });
    const json = await response.json();
    if (!response.ok) {
      return NextResponse.json(json, { status: response.status });
    }
    return NextResponse.json(json);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
