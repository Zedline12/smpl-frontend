"use server";

import { authLoginSchema } from "../schemas/auth.schema";
import { z } from "zod";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";
export async function logout() {
  console.log("logout");
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("refresh_token");
  redirect(`/login`);
}
export async function login(
  unsafeData: z.infer<typeof authLoginSchema>,
): Promise<{ error: boolean; message: string } | undefined> {
  const { success, data } = authLoginSchema.safeParse(unsafeData);
  console.log(success, data);
  if (!success) {
    return { error: true, message: "There was an error creating your product" };
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/email/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  const result = await response.json();
  const { token, refreshToken } = await result.data;

  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  console.log(result);
  redirect(`/`);
}

export async function exchangeToken(exchangeToken: string) {
  try {
    const response = await fetchWithToken("/auth/exchange-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ exchangeToken }),
    });

    if (!response.ok) {
      console.log("error");
      return { error: true, message: "Token exchange failed" };
    }

    const result = await response.json();
    const { token, refreshToken } = result.data;
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
    console.log("hereee")
    console.log("token", cookieStore.get("token"))
    return { success: true };
  }
  catch (err) {
    console.log(err)
  }
}
