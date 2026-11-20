import { redirect } from "next/navigation";

/** Old address: keeps its query (?error=, ?next=) on the way to /sign-in. */
export default async function LoginRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const v of [value].flat()) if (v !== undefined) query.append(key, v);
  }
  const qs = query.toString();
  redirect(`/sign-in${qs ? `?${qs}` : ""}`);
}
