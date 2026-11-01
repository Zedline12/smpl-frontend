import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") ?? "1";
    const limit = searchParams.get("limit") ?? "30";

    const response = await fetchWithToken(
      `/admin/brain/conversations?page=${page}&limit=${limit}`,
    );
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to fetch conversations" },
        { status: response.status },
      );
    }

    return NextResponse.json(data?.data ?? data);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
