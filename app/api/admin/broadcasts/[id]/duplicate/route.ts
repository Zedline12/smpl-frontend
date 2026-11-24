import { proxyToBackend } from "@/lib/backend-proxy";
type Ctx = { params: Promise<{ id: string }> };


export async function POST(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(`/admin/broadcasts/${encodeURIComponent(id)}/duplicate`, { method: "POST" });
}
