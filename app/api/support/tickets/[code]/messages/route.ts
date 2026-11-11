import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** The user's reply on their ticket. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return proxyToBackend(`/support/tickets/${encodeURIComponent(code)}/messages`, {
    method: "POST",
    body: await req.text(),
  });
}
