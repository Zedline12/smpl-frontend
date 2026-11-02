import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET() {
  try {
    const response = await fetchWithToken("/support/categories");
    const data = await response.json().catch(() => null);
    if (!response.ok) return NextResponse.json({ error: "Failed" }, { status: response.status });
    return NextResponse.json(data?.data ?? data);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
