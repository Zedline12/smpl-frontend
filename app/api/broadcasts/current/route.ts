import { proxyToBackend } from "@/lib/backend-proxy";

/** The announcement popup to show the signed-in user now ({ broadcast: … | null }). */
export async function GET() {
  return proxyToBackend("/broadcasts/current");
}
