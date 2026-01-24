
import { fetchWithToken } from "@/lib/fetcher";
import { ApiResponse } from "@/types/api";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const response = await fetchWithToken("/auth/is-auth",{method:"POST"}).then((res) =>
    res.json(),
  ) as ApiResponse;
  if (response.success) {
     redirect("home")
  }
  else {
    redirect("onboard")
  }
}
