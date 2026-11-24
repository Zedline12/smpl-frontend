import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** App Settings → Homepage: saved home page presets. */
export async function GET() {
  return proxyToBackend("/admin/home-presets");
}

export async function POST(req: NextRequest) {
  return proxyToBackend("/admin/home-presets", { method: "POST", body: await req.text() });
}
