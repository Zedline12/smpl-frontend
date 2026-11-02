import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET(req: NextRequest) {
  try {
    const isSubscribed = req.nextUrl.searchParams.get("isSubscribed");
    const params = new URLSearchParams();
    if (isSubscribed) params.set("isSubscribed", isSubscribed);

    const response = await fetchWithToken(
      `/admin/users/locations?${params.toString()}`,
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json({ error: err.message || "Failed" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
