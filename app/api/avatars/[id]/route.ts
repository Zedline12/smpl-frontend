import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(`/avatars/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
