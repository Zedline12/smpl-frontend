import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** Refunds one of the ticket's generations. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(`/admin/support/${encodeURIComponent(id)}/refund-credits`, {
    method: "POST",
    body: await req.text(),
  });
}
