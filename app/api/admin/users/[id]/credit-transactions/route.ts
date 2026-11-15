import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";

/** A user's credit ledger for the admin user page (`?offset&limit&type`). */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const query = new URLSearchParams();
  for (const key of ["offset", "limit", "type"]) {
    const value = req.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }
  try {
    const res = await fetchWithToken(
      `/admin/users/${encodeURIComponent(id)}/credit-transactions?${query}`,
    );
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      return NextResponse.json(
        { message: json?.message ?? "Couldn't load the credit history." },
        { status: res.ok ? 502 : res.status },
      );
    }
    // The backend wraps responses as { success, data }.
    return NextResponse.json(json.data ?? json);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ message: "Couldn't load the credit history." }, { status: 502 });
  }
}
