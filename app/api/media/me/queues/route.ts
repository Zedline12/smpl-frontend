import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET(req: NextRequest) {
  try {
    const domain = req.nextUrl.searchParams.get("domain") ?? "";
    const response = await fetchWithToken(
      `/media/me/queues?domain=${encodeURIComponent(domain)}`,
    );
    // Not always JSON: while the backend restarts, the host answers with an HTML error page.
    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      return NextResponse.json(
        { error: data?.message || "Failed to load generation queue" },
        { status: response.ok ? 502 : response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error loading generation queues:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
