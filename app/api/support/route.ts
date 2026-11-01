import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetchWithToken("/support", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ error: data?.message || "Failed" }, { status: response.status });
    }
    return NextResponse.json(data?.data ?? data);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
