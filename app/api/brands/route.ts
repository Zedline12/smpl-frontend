import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get("limit");
  return proxyToBackend(
    limit ? `/brands?limit=${encodeURIComponent(limit)}` : "/brands",
  );
}

/** Create brand kit manually. */
export async function POST(req: NextRequest) {
  return proxyToBackend("/brands", { method: "POST", body: await req.text() });
}
