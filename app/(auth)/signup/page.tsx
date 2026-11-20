import { redirect } from "next/navigation";

/** Old address: keeps its query (?refToken= from referral links) on the way to /sign-up. */
export default async function SignupRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const v of [value].flat()) if (v !== undefined) query.append(key, v);
  }
  const qs = query.toString();
  redirect(`/sign-up${qs ? `?${qs}` : ""}`);
}
