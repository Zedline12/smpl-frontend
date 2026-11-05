import { proxyToBackend } from "@/lib/backend-proxy";

export async function POST() {
  return proxyToBackend("/admin/notifications/pairing-code", { method: "POST" });
}
