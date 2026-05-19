import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET(req: NextRequest) {
  try {
    const sortBy = req.nextUrl.searchParams.get("sortBy");
    const params = new URLSearchParams({ isSubscribed: "true" });
    if (sortBy) params.set("sortBy", sortBy);

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
    console.error("Error fetching subscribed users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
