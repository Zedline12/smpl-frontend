import { proxyToBackend } from "@/lib/backend-proxy";

/** Active styles (name + thumbnail video). */
export async function GET() {
  return proxyToBackend("/styles");
}
