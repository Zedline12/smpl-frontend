import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type Ctx = { params: Promise<{ id: string }> };


const path = (id: string) => `/admin/broadcasts/${encodeURIComponent(id)}`;

export async function GET(_req: NextRequest, { params }: Ctx) {
  return proxyToBackend(path((await params).id));
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return proxyToBackend(path((await params).id), { method: "PATCH", body: await req.text() });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  return proxyToBackend(path((await params).id), { method: "DELETE" });
}
