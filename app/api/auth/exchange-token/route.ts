import { fetchWithToken } from "@/lib/fetcher";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_OPTIONS } from "@/lib/auth-tokens";

export async function POST(req: NextRequest) {  
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
    const cookieStore = await cookies();
    cookieStore.set("token", token, AUTH_COOKIE_OPTIONS);
    cookieStore.set("refresh_token", refreshToken, AUTH_COOKIE_OPTIONS);
    return NextResponse.json({success: true});
}