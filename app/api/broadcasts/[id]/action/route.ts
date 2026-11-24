import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type Ctx = { params: Promise<{ id: string }> };


export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(`/broadcasts/${encodeURIComponent(id)}/action`, { method: "POST", body: await req.text() });
}
