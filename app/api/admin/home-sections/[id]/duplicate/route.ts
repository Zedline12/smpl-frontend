import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(`/admin/home-sections/${encodeURIComponent(id)}/duplicate`, { method: "POST" });
}
