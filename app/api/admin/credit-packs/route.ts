import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** Admin: every credit pack, inactive included. */
export async function GET() {
  try {
    const res = await fetchWithToken("/credit-packs/all");
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

/** Admin: create a credit pack. */
export async function POST(req: NextRequest) {
  try {
    const res = await fetchWithToken("/credit-packs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await req.text(),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
      return NextResponse.json({ error: message || "Could not create the pack" }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
