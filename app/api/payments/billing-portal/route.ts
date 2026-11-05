import { NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** Creates a Stripe billing portal session and returns its URL. */
export async function POST() {
  try {
    const res = await fetchWithToken("/payments/billing-portal", { method: "POST" });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { message: json?.message ?? "Could not open billing right now." },
        { status: res.status },
      );
    }
    // The backend wraps responses as { success, data }.
    return NextResponse.json(json?.data ?? json);
  } catch {
    return NextResponse.json({ message: "Could not open billing right now." }, { status: 502 });
  }
}
