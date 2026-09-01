import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = (await params).id;

    const response = await fetchWithToken(`/user-subscriptions/${id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json().catch(() => null);

    // Previously this returned 200 regardless, so callers could never detect
    // a failure — the cancel button's try/catch was unreachable.
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to cancel subscription" },
        { status: response.status },
      );
    }

    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
