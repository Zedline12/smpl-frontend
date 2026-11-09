import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET(req: NextRequest) {
  try {
    const sortBy = req.nextUrl.searchParams.get("sortBy");
    const isSubscribed = req.nextUrl.searchParams.get("isSubscribed") ?? "true";
    const page = req.nextUrl.searchParams.get("page") ?? "1";
    const limit = req.nextUrl.searchParams.get("limit") ?? "10";
    const params = new URLSearchParams({ isSubscribed, page, limit });
    if (sortBy) params.set("sortBy", sortBy);
    const billing = req.nextUrl.searchParams.get("billing");
    if (billing) params.set("billing", billing);

    const response = await fetchWithToken(`/admin/users?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch users" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error fetching subscribed users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
