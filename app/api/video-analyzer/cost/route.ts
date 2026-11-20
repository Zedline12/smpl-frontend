import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** What analyzing a video would cost. Charges nothing. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetchWithToken("/video-analyzer/cost", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to calculate the cost" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error pricing video analysis:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
