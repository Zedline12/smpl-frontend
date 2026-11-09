import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

/** Moves the old isTemplate media into templates. ?dryRun=false to write. */
export async function POST(req: NextRequest) {
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "false" ? "false" : "true";
  const res = await fetchWithToken(`/admin/templates/migrate-legacy?dryRun=${dryRun}`, {
    method: "POST",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message || "Could not import the old templates" },
      { status: res.status },
    );
  }
  return NextResponse.json(data);
}
