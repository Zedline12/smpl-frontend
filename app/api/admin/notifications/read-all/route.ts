import { proxyToBackend } from "@/lib/backend-proxy";

export async function PATCH() {
  return proxyToBackend("/admin/notifications/read-all", { method: "PATCH" });
}
