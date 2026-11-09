import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

/** Edits a template's images, videos or published switch. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const id = (await params).id;
  const res = await fetchWithToken(`/admin/templates/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message || "Could not save the template" },
      { status: res.status },
    );
  }
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const id = (await params).id;
  const res = await fetchWithToken(`/admin/templates/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return NextResponse.json(
      { error: data?.message || "Could not delete the template" },
      { status: res.status },
    );
  }
  return NextResponse.json({ success: true });
}
