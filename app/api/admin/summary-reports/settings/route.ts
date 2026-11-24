import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** App Settings → Summary Reports: schedule and recipients. */
export async function GET() {
  return proxyToBackend("/admin/summary-reports/settings");
}

export async function PUT(req: NextRequest) {
  return proxyToBackend("/admin/summary-reports/settings", { method: "PUT", body: await req.text() });
}
