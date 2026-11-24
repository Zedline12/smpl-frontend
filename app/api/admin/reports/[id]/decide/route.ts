import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";
type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  return proxyToBackend(`/admin/reports/${encodeURIComponent((await params).id)}/decide`, { method: "POST", body: await req.text() });
}
