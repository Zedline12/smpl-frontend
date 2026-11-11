import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";
import { clientIpHeader } from "@/lib/client-ip";

/** Starts a Stripe checkout for a credit pack. Body: { creditPackId, captchaToken }. */
export async function POST(req: NextRequest) {
  try {
    const { creditPackId, captchaToken } = await req.json();
    const res = await fetchWithToken("/payments/credit-pack-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...clientIpHeader(req.headers) },
      body: JSON.stringify({ creditPackId, captchaToken }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || "Couldn't start checkout", code: data?.code },
        { status: res.status },
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
