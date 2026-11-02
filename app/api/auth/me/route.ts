import { unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = await fetchWithToken(`/auth/me`);
  console.log(res.status);
  try {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Generation failed");
    }

    return NextResponse.json(data);
  } catch (err: any) {
    unstable_rethrow(err);
    console.log(err);
    return NextResponse.json(
      { message: err.message || "Internal server error" },
      { status: 401 },
    );
  }
}
