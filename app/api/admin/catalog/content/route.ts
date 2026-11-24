import { proxyToBackend } from "@/lib/backend-proxy";

/** Admin → App Settings → Catalog: templates per model and studio content, counted. */
export async function GET() {
  return proxyToBackend("/admin/catalog/content");
}
