import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** What happened to the Stripe Checkout the user just came back from. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const response = await fetchWithToken(`/billing/checkout-result/${encodeURIComponent(sessionId)}`);
    // Not always JSON: while the backend restarts, the host answers with an HTML page.
    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      return NextResponse.json(
        { error: data?.message || "Couldn't load the checkout result" },
        { status: response.ok ? 502 : response.status },
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error loading checkout result:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
