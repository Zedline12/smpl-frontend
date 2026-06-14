import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetchWithToken(`/model-costs`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.message || "Failed to add model cost rule" },
        { status: response.status },
      );
    }

    const data = await response.json().catch(() => null);
    return NextResponse.json(data || { success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating model cost:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
