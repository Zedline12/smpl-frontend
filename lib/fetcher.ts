// lib/fetcher.ts
import { RequestInit } from "next/dist/server/web/spec-extension/request";
import { cookies } from "next/headers";
export async function fetchWithToken(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("token")?.value;
  console.log(cookieStore);
  console.log(accessToken);
  const authHeaders: Record<string, string> = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};

  let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders,
    },
    credentials: "include",
  });

  // If token expired, refresh
  //   if (res.status === 401) {
  //     // Call refresh endpoint
  //     const oldRefreshToken = cookieStore.get("refresh_token")?.value;
  //     if (!oldRefreshToken) throw new Error("No refresh token available");

  //     const refreshRes = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ oldRefreshToken }),
  //       },
  //     );

  //     if (!refreshRes.ok) throw new Error("Refresh token failed");

  //     const data = await refreshRes.json();
  //     const newAccessToken = data.data.accessToken;
  //     const newRefreshToken = data.data.refreshToken;

  //     // Update cookie
  //     cookieStore.set("token", newAccessToken, {
  //       httpOnly: true,
  //       path: "/",
  //       secure: process.env.NODE_ENV === "production",
  //       sameSite: "lax",
  //     });
  //     cookieStore.set("refresh_token", newRefreshToken, {
  //       httpOnly: true,
  //       path: "/",
  //       secure: process.env.NODE_ENV === "production",
  //       sameSite: "lax",
  //     });
  //     // Retry original request with new token
  //     res = await fetch(url, {
  //       ...options,
  //       headers: {
  //         ...options.headers,
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });
  //   }

  return res;
}
