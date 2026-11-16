import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

/**
 * Proxies /api/admin/brain/* to the backend's Smpl Brain API with the admin token:
 * the JSON ask, conversations (list, search, rename, delete, messages), the overview,
 * and action confirm/cancel. The live stream has its own route (./stream).
 */
async function proxy(req: NextRequest, path: string[] | undefined, method: Method) {
  try {
    const query = req.nextUrl.searchParams.toString();
    const suffix = path?.length ? `/${path.map(encodeURIComponent).join("/")}` : "";
    const body = method === "POST" || method === "PATCH" ? await req.text() : undefined;
    const response = await fetchWithToken(`/admin/brain${suffix}${query ? `?${query}` : ""}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body } : {}),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      const message = Array.isArray(json?.message) ? json.message.join(", ") : json?.message;
      return NextResponse.json({ error: message || "Request failed" }, { status: response.status });
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Admin brain proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return proxy(req, (await params).path, "GET");
}

export async function POST(req: NextRequest, { params }: Ctx) {
  return proxy(req, (await params).path, "POST");
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return proxy(req, (await params).path, "PATCH");
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return proxy(req, (await params).path, "DELETE");
}
