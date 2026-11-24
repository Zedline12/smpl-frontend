import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LegalMarkdown } from "@/features/legal/LegalMarkdown";

const SLUGS = ["terms", "privacy", "cookies", "acceptable-use", "refund-policy", "copyright", "ai-content"] as const;
type Slug = (typeof SLUGS)[number];

const TITLES: Record<Slug, string> = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  cookies: "Cookie Policy",
  "acceptable-use": "Acceptable Use Policy",
  "refund-policy": "Refund Policy",
  copyright: "Copyright & DMCA Policy",
  "ai-content": "AI Content Policy",
};

/** Until a version is published in the app, the old pages still apply. */
const LEGACY: Partial<Record<Slug, string>> = {
  terms: "https://smplcontent.com/terms",
  privacy: "https://smplcontent.com/privacy-policy",
  "refund-policy": "https://smplcontent.com/refund-policy",
  "acceptable-use": "https://smplcontent.com/acceptable-use-policy",
  copyright: "https://smplcontent.com/copyright-policy",
  cookies: "https://smplcontent.com/cookie-policy",
};

interface Doc {
  slug: string;
  title: string;
  version: number;
  body: string;
  publishedAt: string | null;
  versions: { version: number; publishedAt: string | null }[];
}

async function load(slug: Slug, version?: string): Promise<Doc | null> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  const url = version ? `${api}/legal/${slug}/v/${encodeURIComponent(version)}` : `${api}/legal/${slug}`;
  const res = await fetch(url, { next: { revalidate: 300 } }).catch(() => null);
  if (!res?.ok) return null;
  const json = await res.json().catch(() => null);
  const data = json?.data ?? json;
  return version ? (data as Doc) : ((data?.doc as Doc | null) ?? null);
}

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ v?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = TITLES[slug as Slug];
  return title ? { title: `${title} · smpl` } : {};
}

export default async function LegalPage({ params, searchParams }: Props) {
  const { slug: raw } = await params;
  const { v } = await searchParams;
  if (!(SLUGS as readonly string[]).includes(raw)) notFound();
  const slug = raw as Slug;
  const doc = await load(slug, v);

  if (!doc) {
    if (!v && LEGACY[slug]) redirect(LEGACY[slug]!);
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-3xl font-bold text-white">{TITLES[slug]}</h1>
        <p className="mt-4 text-white/60">This page is being prepared. Questions? Contact us via the support page.</p>
      </div>
    );
  }

  const date = doc.publishedAt ? new Date(doc.publishedAt).toLocaleDateString("en-US", { dateStyle: "long" }) : null;
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="mb-6 text-xs text-white/40">
        Version {doc.version}
        {date ? ` · effective ${date}` : ""}
        {v ? (
          <>
            {" · "}
            <Link href={`/legal/${slug}`} className="underline">
              see the current version
            </Link>
          </>
        ) : null}
      </p>
      <LegalMarkdown body={doc.body} />
      {!v && doc.versions?.length > 1 && (
        <div className="mt-12 border-t border-white/10 pt-5 text-sm text-white/50">
          <p className="mb-2 font-medium text-white/70">Previous versions</p>
          <ul className="space-y-1">
            {doc.versions.slice(1).map((x) => (
              <li key={x.version}>
                <Link href={`/legal/${slug}?v=${x.version}`} className="underline">
                  Version {x.version}
                </Link>
                {x.publishedAt ? ` · ${new Date(x.publishedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
      <nav className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-5 text-xs text-white/40">
        {SLUGS.filter((s) => s !== slug).map((s) => (
          <Link key={s} href={`/legal/${s}`} className="hover:text-white/70">
            {TITLES[s]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
