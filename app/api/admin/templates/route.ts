import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const params = new URLSearchParams();
  for (const key of ["model", "type", "limit", "offset"]) {
    const value = req.nextUrl.searchParams.get(key);
    if (value) params.set(key, value);
  }
  const res = await fetchWithToken(`/admin/templates?${params}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message || "Could not load templates" },
      { status: res.status },
    );
  }
  return NextResponse.json(data);
}
