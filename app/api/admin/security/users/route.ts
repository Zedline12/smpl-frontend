import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") ?? "threat";
    const page = req.nextUrl.searchParams.get("page") ?? "1";
    const limit = req.nextUrl.searchParams.get("limit") ?? "20";
    const params = new URLSearchParams({ type, page, limit });

    const response = await fetchWithToken(
      `/admin/users/security/users?${params.toString()}`,
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
