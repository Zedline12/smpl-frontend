import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";

/** Forwards a request to the backend with the user's token and returns its JSON as-is. */
type ProxyInit = { method?: string; body?: string; headers?: Record<string, string> };

export async function proxyToBackend(path: string, init: ProxyInit = {}) {
  try {
    const response = await fetchWithToken(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    if (response.status === 204) return new NextResponse(null, { status: 204 });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ error: data?.message || "Failed" }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
