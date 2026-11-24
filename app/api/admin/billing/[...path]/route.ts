import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

type Method = "GET" | "POST" | "PATCH";

/**
 * Proxies /api/admin/billing/* to the backend's admin billing API with the admin token.
 * JSON is unwrapped; files (dispute evidence: PDF, xlsx, CSV, zip) are passed through
 * as bytes with their download headers.
 */
async function proxy(req: NextRequest, path: string[], method: Method) {
  try {
    const query = req.nextUrl.searchParams.toString();
    const body = method === "GET" ? undefined : await req.text();
    const response = await fetchWithToken(
      `/admin/billing/${path.map(encodeURIComponent).join("/")}${query ? `?${query}` : ""}`,
      { method, headers: { "Content-Type": "application/json" }, ...(body ? { body } : {}) },
    );
    const type = response.headers.get("content-type") ?? "";
    if (response.ok && !type.includes("application/json")) {
      const headers = new Headers({ "Content-Type": type || "application/octet-stream", "Cache-Control": "no-store" });
      const disposition = response.headers.get("content-disposition");
      if (disposition) headers.set("Content-Disposition", disposition);
      const length = response.headers.get("content-length");
      if (length) headers.set("Content-Length", length);
      return new NextResponse(response.body, { status: 200, headers });
    }
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ error: json?.message || json?.error?.message || "Request failed" }, { status: response.status });
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Admin billing proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return proxy(req, (await params).path, "GET");
}

export async function POST(req: NextRequest, { params }: Ctx) {
  return proxy(req, (await params).path, "POST");
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return proxy(req, (await params).path, "PATCH");
}
