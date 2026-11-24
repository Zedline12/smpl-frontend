import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** Admin → Generations: totals, models vs generators over time, per-model table. */
export async function GET(req: NextRequest) {
  return proxyToBackend(`/admin/generations/stats?${req.nextUrl.searchParams}`);
}
