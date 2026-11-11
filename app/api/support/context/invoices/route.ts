import { proxyToBackend } from "@/lib/backend-proxy";

/** The user's paid invoices, for the billing ticket picker. */
export async function GET() {
  return proxyToBackend("/support/context/invoices");
}
