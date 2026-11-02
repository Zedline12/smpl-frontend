import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get("page") ?? "1";
    const limit = req.nextUrl.searchParams.get("limit") ?? "20";
    const params = new URLSearchParams({ page, limit });

    const response = await fetchWithToken(
      `/admin/users/security/blocked-ips?${params.toString()}`,
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

export async function POST(req: NextRequest) {
  try {
    const { ip, note } = await req.json();
    const response = await fetchWithToken(`/admin/users/security/blocked-ips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, note }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed" }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
