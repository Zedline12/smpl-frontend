import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";
type Ctx = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  return proxyToBackend(`/admin/legal/${encodeURIComponent((await params).slug)}/publish`, { method: "POST", body: await req.text() });
}
