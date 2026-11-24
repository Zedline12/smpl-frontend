"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUDIO_MODELS, IMAGE_MODELS, VIDEO_MODELS } from "@/features/generation/enums/models.enum";
import { useCatalog, withCatalog } from "@/features/catalog/catalog";
import { CookieSettingsLink } from "@/features/legal/CookieNotice";

type FooterLink = { href: string; label: string; external?: boolean };

/** Links with the catalog's names; ones an admin turned off are left out. */
const modelLinks = (models: { id: string; name: string; description: string }[], page: string): FooterLink[] =>
  withCatalog(models).map((m) => ({ href: `/create/${page}?model=${m.id}`, label: m.name }));

const create: FooterLink[] = [
  { href: "/create/image", label: "AI Image" },
  { href: "/create/video", label: "AI Video" },
  { href: "/create/audio", label: "AI Audio" },
  { href: "/create/audio?model=smpl-voice-changer", label: "Voice Changer" },
  { href: "/assets", label: "My Assets" },
  { href: "/projects", label: "Projects" },
];

const studios: FooterLink[] = [
  { href: "/clipping-studio", label: "Clipping Studio" },
  { href: "/ads-studio", label: "Ads Studio" },
  { href: "/ai-influencer-studio", label: "AI Influencer" },
  { href: "/artist", label: "Artist" },
  { href: "/create/video?model=smpl-remix", label: "Remix" },
  { href: "/video-analyzer", label: "Video Analyzer" },
  { href: "/prompt-maker", label: "Prompt Maker" },
];

const platform: FooterLink[] = [
  { href: "/pricing", label: "Pricing" },
  { href: "/me/settings/mcp", label: "MCP" },
  { href: "/me/settings/referrals", label: "Referrals" },
  { href: "/me/settings/support", label: "Support" },
];

const resources: FooterLink[] = [
  { href: "https://smplcontent.com/blog", label: "Blog", external: true },
  { href: "https://smplcontent.com/#faq", label: "FAQ", external: true },
];

/** In-app pages (they forward to the old smplcontent.com pages until a version is published). */
const legal: FooterLink[] = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/refund-policy", label: "Refund Policy" },
  { href: "/legal/acceptable-use", label: "Acceptable Use" },
  { href: "/legal/copyright", label: "Copyright Policy" },
  { href: "/legal/cookies", label: "Cookie Policy" },
  { href: "/legal/ai-content", label: "AI Content" },
  { href: "/ai-check", label: "Check if smpl made it" },
  { href: "/report", label: "Report content" },
];

function Column({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <p className="mb-4 text-sm text-white/60">{title}</p>
      <ul className="flex flex-col gap-2.5">
        {links.map(({ href, label, external }) => (
          <li key={href + label}>
            <Link
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-[14px] font-medium text-white transition-opacity hover:opacity-70 sm:text-[15px]"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Work pages (create, studios) fill the screen; the footer only belongs on browsing pages. */
const NO_FOOTER = [
  "/create",
  "/clipping-studio",
  "/ads-studio",
  "/ai-influencer-studio",
  "/artist",
  "/video-analyzer",
  "/prompt-maker",
];

export default function Footer() {
  const pathname = usePathname();
  // Model names below follow the catalog.
  useCatalog();
  if (NO_FOOTER.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return (
    <footer className="bg-primary z-100 w-full shrink-0 px-5 pt-10 pb-6 text-white sm:px-6 sm:pt-12">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_3fr]">
        <h2
          className="text-[28px] leading-[1.05] font-extrabold tracking-tight uppercase sm:text-[34px] md:text-[44px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          AI-native
          <br />
          creative suite
        </h2>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-10 xl:grid-cols-5">
          <div className="flex flex-col gap-10">
            <Column title="Create" links={create} />
            <Column title="Audio Models" links={modelLinks(AUDIO_MODELS, "audio")} />
          </div>
          <Column title="Video Models" links={modelLinks(VIDEO_MODELS, "video")} />
          <Column title="Image Models" links={modelLinks(IMAGE_MODELS, "image")} />
          <div className="flex flex-col gap-10">
            <Column title="Studios" links={studios} />
            <Column title="Platform" links={platform} />
          </div>
          <div className="flex flex-col gap-10">
            <Column title="Resources" links={resources} />
            <div>
              <Column title="Legal" links={legal} />
              <CookieSettingsLink className="mt-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-70 sm:text-[15px]" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-col gap-2 border-t border-white/20 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} SmplContent. All rights reserved.</p>
        <p className="text-white/70">Made for creators.</p>
      </div>
    </footer>
  );
}
