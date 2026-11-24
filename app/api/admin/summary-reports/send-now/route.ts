import { proxyToBackend } from "@/lib/backend-proxy";

/** Emails the last period's report now. */
export async function POST() {
  return proxyToBackend("/admin/summary-reports/send-now", { method: "POST", body: "{}" });
}
