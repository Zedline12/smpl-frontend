import { NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET() {
  try {
    const response = await fetchWithToken("/admin/users/security/stats");

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json({ error: err.message || "Failed" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
