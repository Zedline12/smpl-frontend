import { fetchWithToken } from "@/lib/fetcher";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    console.log("exchange-token hereee")   
    const body = await req.json();
    const {exchangeToken} = body;
    const res = await fetchWithToken(`/auth/exchange-token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ exchangeToken }),
    });
    const result = await res.json();
    const { token, refreshToken } = result.data;
    console.log("token", token)
    console.log("refreshToken", refreshToken)
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
    });
    cookieStore.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
    });
    console.log("token", cookieStore.get("token"))
    return NextResponse.json({success: true});
}