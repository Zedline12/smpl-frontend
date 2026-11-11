"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUDIO_MODELS, IMAGE_MODELS, VIDEO_MODELS } from "@/features/generation/enums/models.enum";

type FooterLink = { href: string; label: string; external?: boolean };

const modelLinks = (models: { id: string; name: string }[], page: string): FooterLink[] =>
  models.map((m) => ({ href: `/create/${page}?model=${m.id}`, label: m.name }));

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
  { href: "/marketing-studio", label: "Marketing Studio" },
  { href: "/create/image?model=higgsfield-ads-studio", label: "Ads Studio" },
  { href: "/ai-influencer-studio", label: "AI Influencer" },
  { href: "/artist", label: "Artist" },
  { href: "/remix", label: "Remix" },
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

const legal: FooterLink[] = [
  { href: "https://smplcontent.com/privacy-policy", label: "Privacy Policy", external: true },
  { href: "https://smplcontent.com/terms", label: "Terms of Service", external: true },
  { href: "https://smplcontent.com/refund-policy", label: "Refund Policy", external: true },
  { href: "https://smplcontent.com/acceptable-use-policy", label: "Acceptable Use", external: true },
  { href: "https://smplcontent.com/copyright-policy", label: "Copyright Policy", external: true },
  { href: "https://smplcontent.com/cookie-policy", label: "Cookie Policy", external: true },
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
  "/marketing-studio",
  "/ai-influencer-studio",
  "/artist",
  "/remix",
  "/video-analyzer",
  "/prompt-maker",
];

export default function Footer() {
  const pathname = usePathname();
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
            <Column title="Legal" links={legal} />
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
