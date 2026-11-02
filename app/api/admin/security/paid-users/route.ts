import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get("page") ?? "1";
    const limit = req.nextUrl.searchParams.get("limit") ?? "20";
    const params = new URLSearchParams({ page, limit });

    const response = await fetchWithToken(
      `/admin/users/security/paid-users?${params.toString()}`,
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json({ error: err.message || "Failed" }, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
