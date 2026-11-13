import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

/** Proxies /api/admin/releases/* to the backend's admin releases API with the admin token. */
async function proxy(req: NextRequest, path: string[] | undefined, method: Method) {
  try {
    const query = req.nextUrl.searchParams.toString();
    const suffix = path?.length ? `/${path.map(encodeURIComponent).join("/")}` : "";
    const body = method === "POST" || method === "PATCH" ? await req.text() : undefined;
    const response = await fetchWithToken(`/admin/releases${suffix}${query ? `?${query}` : ""}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body } : {}),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      // Validation errors come as { error: { errors: { field: message } } }.
      const fieldErrors = json?.error?.errors;
      const message =
        fieldErrors && typeof fieldErrors === "object"
          ? Object.values(fieldErrors).flat().join(", ")
          : Array.isArray(json?.message)
            ? json.message.join(", ")
            : json?.message;
      return NextResponse.json({ error: message || "Request failed" }, { status: response.status });
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Admin releases proxy error:", error);
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
