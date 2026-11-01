"use client";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { SupportModal } from "@/features/support/components/SupportModal";

export type SidebarItem = {
  label: string;
  icon: ReactNode;
  url: string;
};

export type SidebarSection = {
  title?: string;
  items: SidebarItem[];
};

const TRI_GRADIENT = "linear-gradient(135deg, #6b41ff 0%, #ea4bff 50%, #ff6b00 100%)";

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "Create",
    items: [
      {
        label: "Start Generating",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
            <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
            <path fillRule="evenodd" d="M9.344 3.071a1.5 1.5 0 0 1 1.06-.44h3.192a1.5 1.5 0 0 1 1.06.44l1.061 1.06a1.5 1.5 0 0 0 1.06.44h1.473A2.25 2.25 0 0 1 20.5 6.821v10.358a2.25 2.25 0 0 1-2.25 2.25H5.75a2.25 2.25 0 0 1-2.25-2.25V6.821a2.25 2.25 0 0 1 2.25-2.25h1.473a1.5 1.5 0 0 0 1.06-.44l1.061-1.06ZM12 7.5a5.25 5.25 0 1 0 0 10.5A5.25 5.25 0 0 0 12 7.5Z" clipRule="evenodd" />
          </svg>
        ),
        url: "/create",
      },
      {
        label: "Motion Transfer",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10.5l3 1.5-3 1.5v-3Z" />
          </svg>
        ),
        url: "/create/motion-transfer",
      },
      {
        label: "AI Influencer",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        ),
        url: "/ai-influencer-studio",
      },
      {
        label: "Ads Studio",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.69-.03-1.38-.04-2.09-.04H7.5a4.5 4.5 0 1 1 0-9h.75c.71 0 1.4-.01 2.09-.04m0 9.08c.25.97.58 1.91.99 2.81.25.56.06 1.24-.48 1.55l-.65.38a1.14 1.14 0 0 1-1.6-.49 22.6 22.6 0 0 1-1.48-3.56m3.22-.69a24 24 0 0 1 0-9.08m0 9.08c3.52.16 6.82 1.1 9.75 2.65A24 24 0 0 0 21 12c0-1.69-.18-3.33-.51-4.92a23.7 23.7 0 0 1-9.75 2.68" />
          </svg>
        ),
        url: "/ads-studio",
      },
      {
        label: "Artist",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
          </svg>
        ),
        url: "/artist",
      },
      {
        label: "Remix",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
          </svg>
        ),
        url: "/remix",
      },
      {
        label: "Prompt Maker",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Z" />
            <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42L18.37 3.29a1.003 1.003 0 0 0-1.42 0l-1.13 1.13 3.75 3.75 1.14-1.13Z" />
          </svg>
        ),
        url: "/prompt-maker",
      },
    ],
  },
  {
    title: "Your Content",
    items: [
      {
        label: "Your Creations",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
            <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875Z" />
            <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 0 0 1.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 0 0 1.897 1.384C6.809 12.164 9.315 12.75 12 12.75Z" />
            <path d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 15.914 9.315 16.5 12 16.5Z" />
            <path d="M12 20.25c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 19.664 9.315 20.25 12 20.25Z" />
          </svg>
        ),
        url: "/assets",
      },
      {
        label: "Projects",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
          </svg>
        ),
        url: "/projects",
      },
    ],
  },
  {
    title: "",
    items: [
      {
        label: "Support",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
        ),
        url: "#support",
      },
      {
        label: "Referral & Rewards",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
        ),
        url: "/settings/referrals",
      },
    ],
  },
];

export function Sidebar() {
  const guard = useAuthGuard();
  const { user } = useAuth();
  const router = useRouter();
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
    <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    <aside id="tour-sidebar" className="flex sm:justify-center xl:justify-start xl:p-4 xl:flex-col w-full h-full border-t border-r border-border overflow-y-auto">
      <div className="flex flex-col items-center xl:items-start xl:p-2 h-full">
        {/* Home */}
        <button
          type="button"
          onClick={() => (user ? guard(() => redirect("/")) : router.push("/login"))}
          className="cursor-pointer mb-3 flex w-full items-center justify-center xl:justify-start gap-x-3.5 py-2.5 px-2.5 text-sm text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <span className="sidebar-icon-glow flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </span>
          <span className="hidden xl:inline">Home</span>
        </button>
        {SIDEBAR_SECTIONS.map((section, sectionIdx) => (
          <div key={sectionIdx} className="w-full pt-5 pb-6 border-b border-border">
            {section.title && (
              <div className="hidden xl:block text-foreground px-2.5 text-xs font-bold uppercase tracking-wider mb-2">
                {section.title}
              </div>
            )}
            <ul className="xl:space-y-3 space-y-5 w-full">
              {section.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <div
                    className="animate-tri-glow p-[1.5px] rounded-xl transition-all duration-300 hover:scale-[1.02]"
                    style={{ background: TRI_GRADIENT, backgroundSize: "200% 200%" }}
                  >
                    {item.url === "#support" ? (
                      <button
                        onClick={() => user ? setSupportOpen(true) : router.push("/login")}
                        className="flex w-full items-center justify-center xl:justify-start gap-x-3 py-2.5 px-2.5 rounded-xl bg-background"
                      >
                        <span
                          className="flex-shrink-0 p-1.5 rounded-lg"
                          style={{ background: TRI_GRADIENT, color: "white" }}
                        >
                          {item.icon}
                        </span>
                        <span className="hidden xl:inline text-sm font-medium text-foreground">
                          {item.label}
                        </span>
                      </button>
                    ) : (
                      <Link
                        href={user ? item.url : "/login"}
                        className="flex w-full items-center justify-center xl:justify-start gap-x-3 py-2.5 px-2.5 rounded-xl bg-background"
                      >
                        <span
                          className="flex-shrink-0 p-1.5 rounded-lg"
                          style={{ background: TRI_GRADIENT, color: "white" }}
                        >
                          {item.icon}
                        </span>
                        <span className="hidden xl:inline text-sm font-medium text-foreground">
                          {item.label}
                        </span>
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Profile */}
        {user?.username && (
          <div className="w-full pt-5 pb-6 border-b border-border">
            <Link
              href={`/profile/${user.username}`}
              className="flex w-full items-center justify-center xl:justify-start gap-x-3.5 py-2.5 px-2.5 text-sm text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <span className="flex-shrink-0">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="Profile"
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                )}
              </span>
              <span className="hidden xl:inline">My Profile</span>
            </Link>
          </div>
        )}

        {/* Get More Credits */}
        <div className="mt-auto pt-5 w-full">
          <Link
            href={user ? "/subscription-plans" : "/login"}
            className="flex w-full items-center justify-center xl:justify-start gap-x-3.5 py-2.5 px-2.5 text-sm text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span className="flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path
                  fillRule="evenodd"
                  d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="hidden xl:inline">Get More Credits</span>
          </Link>
        </div>
      </div>
    </aside>
    </>
  );
}
