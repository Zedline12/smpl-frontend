import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** Recent report sends. */
export async function GET(req: NextRequest) {
  return proxyToBackend(`/admin/summary-reports/runs?${req.nextUrl.searchParams}`);
}
