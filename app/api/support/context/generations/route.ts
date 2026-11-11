import { proxyToBackend } from "@/lib/backend-proxy";

/** The user's stuck, failed and recent generations, for the ticket picker. */
export async function GET() {
  return proxyToBackend("/support/context/generations");
}
