import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const res = await fetchWithToken(`/media/signed-url`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json().catch(() => ({ message: `Backend answered ${res.status}` }));
    // Keep the backend's status, so a failed signature isn't read as a success.
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[upload-signature]", err);
    return NextResponse.json({ message: "The server could not be reached" }, { status: 502 });
  }
}
