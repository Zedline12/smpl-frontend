import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetchWithToken("/auth/email/forget-password", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    if (response.status === 204) {
  return new NextResponse(null, { status: 204 });
}
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
