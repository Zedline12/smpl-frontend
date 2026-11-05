import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(req: NextRequest) {
  const qs = new URLSearchParams();
  for (const key of ["page", "limit", "level", "unread"]) {
    const value = req.nextUrl.searchParams.get(key);
    if (value) qs.set(key, value);
  }
  return proxyToBackend(`/admin/notifications?${qs.toString()}`);
}
