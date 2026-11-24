import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";
type Ctx = { params: Promise<{ slug: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  return proxyToBackend(`/admin/legal/${encodeURIComponent((await params).slug)}/draft`, { method: "PUT", body: await req.text() });
}
