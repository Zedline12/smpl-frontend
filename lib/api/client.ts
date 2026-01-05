import { toast } from "sonner";

export async function apiFetch(path: string, options?: RequestInit) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${path}`, {
    ...options,
    credentials: "include", // sends cookies
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (response.status === 401 || data.statusCode === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
    throw new Error(data.message || "Unauthorized");
  }

  if (!response.ok) {
    const message = data.message || "An error occurred";
    toast.error(message);
    throw new Error(message);
  }

  return data.data;
}
