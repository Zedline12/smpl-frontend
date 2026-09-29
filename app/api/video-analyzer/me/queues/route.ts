import { NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET() {
  try {
    const response = await fetchWithToken("/video-analyzer/me/queues");
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to load analysis jobs" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error loading video analyzer queues:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
