import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(`/brands/${encodeURIComponent(id)}`);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(`/brands/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: await req.text(),
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(`/brands/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
