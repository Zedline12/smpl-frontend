import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await fetchWithToken(`/admin/support/${id}`);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ error: data?.message || "Failed" }, { status: response.status });
    }
    return NextResponse.json(data?.data ?? data);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
