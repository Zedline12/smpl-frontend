import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** Proxies /api/admin/billing/* to the backend's admin billing API with the admin token. */
async function proxy(req: NextRequest, path: string[], method: "GET" | "POST") {
  try {
    const query = req.nextUrl.searchParams.toString();
    const response = await fetchWithToken(
      `/admin/billing/${path.map(encodeURIComponent).join("/")}${query ? `?${query}` : ""}`,
      { method, headers: { "Content-Type": "application/json" } },
    );
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ error: json?.message || "Request failed" }, { status: response.status });
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
