import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(`/admin/styles/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: await req.text(),
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const hard = req.nextUrl.searchParams.get("hard") === "true" ? "?hard=true" : "";
  return proxyToBackend(`/admin/styles/${encodeURIComponent(id)}${hard}`, { method: "DELETE" });
}
