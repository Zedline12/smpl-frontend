import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

/** Proxies /api/generation-estimates/* to the backend's admin generation-times API. */
async function proxy(req: NextRequest, path: string[] | undefined, method: Method) {
  try {
    const suffix = path?.length ? `/${path.map(encodeURIComponent).join("/")}` : "";
    const body = method === "POST" || method === "PATCH" ? await req.text() : undefined;
    const response = await fetchWithToken(`/generation-estimates${suffix}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body } : {}),
    });
    if (response.status === 204) return new NextResponse(null, { status: 204 });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      const fieldErrors = json?.error?.errors;
      const message =
        fieldErrors && typeof fieldErrors === "object"
          ? Object.values(fieldErrors).flat().join(", ")
          : json?.message;
      return NextResponse.json({ error: message || "Request failed" }, { status: response.status });
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    unstable_rethrow(error);
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
