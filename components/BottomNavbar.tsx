"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { SIDEBAR_SECTIONS } from "./sidebar";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

export type BottomNavItem = {
  title: string;
  link?: string;
  icon: React.ReactNode;
};

interface BottomNavbarProps {
  items: BottomNavItem[];
}

export default function BottomNavbar({ items }: BottomNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`absolute bottom-0 left-0 w-full bg-background-light rounded-t-2xl p-6 transition-transform duration-500 ease-in-out ${
            isMenuOpen ? "translate-y-0" : "translate-y-full"
          } max-h-[80vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-background-light z-10 py-2">
            <h2 className="text-xl font-bold text-foreground">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 bg-background-lighter rounded-full text-foreground hover:bg-neutral-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6 pb-10">
            {SIDEBAR_SECTIONS.map((section, idx) => (
              <div key={idx}>
                {section.title && (
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {section.items.map((item, itemIdx) => (
                    <Link
                      key={itemIdx}
                      href={user ? item.url : "/login"}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-4 bg-background-lighter rounded-xl hover:bg-neutral-800 transition-colors gap-2"
                    >
                      <div className="text-secondary-foreground">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navbar */}
      <div className="fixed sm:hidden block bottom-0 left-0 w-full bg-background-light border-t border-neutral-800 pb-2 pt-2 z-50">
        <div className="flex justify-around items-center">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 w-full p-2 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-secondary-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>

            <span className="text-[10px] font-medium text-secondary-foreground group-hover:text-foreground transition-colors">
              Menu
            </span>
          </button>
          {items.map((item, index) => {
            const isMenu = index === 0;
            const Content = (
              <>
                <div className="text-secondary-foreground group-hover:text-foreground transition-colors">
                  {item.icon}
                </div>
                <span className="text-xs text-secondary-foreground font-medium  group-hover:text-foreground transition-colors">
                  {item.title}
                </span>
              </>
            );

            return (
              <Link
                key={index}
                href={user ? item.link || "#" : "/login"}
                className="flex flex-col items-center justify-center gap-1 w-full p-2 group"
              >
                {Content}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
