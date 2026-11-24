import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** Public: was this made with smpl? ({ sha256 } or { url }) */
export async function POST(req: NextRequest) {
  return proxyToBackend("/ai-check", { method: "POST", body: await req.text() });
}
