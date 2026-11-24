import { proxyToBackend } from "@/lib/backend-proxy";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  return proxyToBackend(`/admin/reports/${encodeURIComponent((await params).id)}`);
}
