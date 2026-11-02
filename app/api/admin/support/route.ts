import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const response = await fetchWithToken(`/admin/support?${searchParams.toString()}`);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ error: data?.message || "Failed" }, { status: response.status });
    }
    return NextResponse.json(data?.data ?? data);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
