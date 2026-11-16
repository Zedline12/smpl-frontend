import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** App Appearance → Homepage Sections. */
export async function GET() {
  return proxyToBackend("/admin/home-sections");
}

export async function POST(req: NextRequest) {
  return proxyToBackend("/admin/home-sections", { method: "POST", body: await req.text() });
}
