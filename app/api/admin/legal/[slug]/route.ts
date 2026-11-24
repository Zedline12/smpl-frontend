import { proxyToBackend } from "@/lib/backend-proxy";
type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  return proxyToBackend(`/admin/legal/${encodeURIComponent((await params).slug)}`);
}
