import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";


/** Admin → Announcements. */
export async function GET() {
  return proxyToBackend("/admin/broadcasts");
}

export async function POST(req: NextRequest) {
  return proxyToBackend("/admin/broadcasts", { method: "POST", body: await req.text() });
}
