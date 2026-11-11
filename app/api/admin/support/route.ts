import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** Admin ticket list; keeps the pagination next to the rows. */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const response = await fetchWithToken(`/admin/support?${searchParams.toString()}`);
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ error: json?.message || "Failed" }, { status: response.status });
    }
    return NextResponse.json({ data: json?.data ?? [], pagination: json?.pagination ?? null });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
