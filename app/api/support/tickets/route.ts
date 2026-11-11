import { proxyToBackend } from "@/lib/backend-proxy";

/** The signed-in user's tickets. */
export async function GET() {
  return proxyToBackend("/support/tickets");
}
