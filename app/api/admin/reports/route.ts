import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? "open";
  return proxyToBackend(`/admin/reports?status=${encodeURIComponent(status)}`);
}
