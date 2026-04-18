import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest,
  { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const res = await fetchWithToken(`/user-subscriptions/${id}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await res.json();
  return NextResponse.json(json);
}
