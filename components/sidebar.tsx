"use client";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export type SidebarItem = {
  label: string;
  icon: ReactNode;
  url: string;
};

export type SidebarSection = {
  title?: string;
  items: SidebarItem[];
};

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "Create",
    items: [
      {
        label: "Generations",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
              clipRule="evenodd"
            />
          </svg>
        ),
        url: "/create",
      },
      {
        label: "Prompt Maker",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
              clipRule="evenodd"
            />
          </svg>
        ),
        url: "https://smpl.base44.app",
      }
    ],
  },
  {
    title: "Your Content",
    items: [
      {
        label: "Assets",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="text-muted size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
            />
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="text-muted size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
            />
          </svg>
        ),
        url: "https://mail.google.com/mail/?view=cm&fs=1&to=Team@smplsocial.io&su=SUPPORT",
      },
      {
        label: "Discord",
        icon: (
          <DiscordLogoIcon className="text-muted size-5" />
        ),
        url: "https://discord.gg/ADZBJQJuwq",
      }
    ],
  },
];

export function Sidebar() {
  const guard = useAuthGuard();
  return (
    <aside className="  flex sm:justify-center xl:justify-start xl:p-4 xl:flex-col w-full h-full border-t border-r  border-neutral-700 overflow-y-auto">
      <div className="flex flex-col items-center xl:items-start xl:p-2 ">
        <button
          type="button"
          onClick={() => guard(() => redirect("/"))}
          className="cursor-pointer mb-3 flex w-full items-center justify-center xl:justify-start gap-x-3.5 py-2.5 px-2.5 text-sm text-secondary-foreground  rounded-lg hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>

          <span className="hidden xl:inline">Home</span>
        </button>

        {SIDEBAR_SECTIONS.map((section, sectionIdx) => (
          <div
            key={sectionIdx}
            className="w-full    pt-5 pb-5 border-b border-neutral-700"
          >
            {section.title && (
              <div className="hidden xl:block text-neutral-500 px-2.5 text-xs font-bold uppercase tracking-wider mb-2">
                {section.title}
              </div>
            )}
            <ul className="xl:space-y-1 space-y-5  w-full">
              {section.items.map((item, itemIdx) => (
                <li className="cursor-pointer" key={itemIdx}>
                  <Link
                    href={item.url}
                    className="cursor-pointer flex w-full items-center justify-center xl:justify-start gap-x-3.5 py-2.5 px-2.5 text-sm text-secondary-foreground  rounded-lg hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
                  >
                    {item.icon}
                    <span className="hidden xl:inline">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
