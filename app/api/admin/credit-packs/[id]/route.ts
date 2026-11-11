import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

type Ctx = { params: Promise<{ id: string }> };

/** Admin: edit a credit pack. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const id = (await params).id;
    const res = await fetchWithToken(`/credit-packs/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: await req.text(),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
      return NextResponse.json({ error: message || "Could not save the pack" }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** Admin: delete a credit pack. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const id = (await params).id;
    const res = await fetchWithToken(`/credit-packs/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return NextResponse.json({ error: data?.message || "Could not delete the pack" }, { status: res.status });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
