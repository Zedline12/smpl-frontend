import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** Buyable credit packs. */
export async function GET() {
  try {
    const res = await fetchWithToken("/credit-packs");
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json({ error: data?.message || "Could not load credit packs" }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
