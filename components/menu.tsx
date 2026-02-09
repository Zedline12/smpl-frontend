"use client";

import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const MenuContext = createContext<{ close: () => void } | null>(null);

interface MenuProps {
  children: React.ReactNode;
  align?: "left" | "right";
  direction?: "up" | "down";
  trigger?: React.ReactNode;
  className?: string;
}

export function Menu({
  children,
  align = "right",
  direction = "down",
  trigger,
  className,
}: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <MenuContext.Provider value={{ close }}>
      <div
        className={cn("relative inline-block text-left", className)}
        ref={menuRef}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex items-center justify-center p-2 rounded-lg hover:bg-neutral-800/50 transition-colors text-secondary-foreground"
        >
          {trigger || <MoreVertical className="w-5 h-5" />}
        </button>

        {isOpen && (
          <div
            className={cn(
              "absolute z-50 min-w-[180px] rounded-xl border border-neutral-800 shadow-xl bg-background-light  animate-in fade-in zoom-in-95 duration-100",
              direction === "down" ? "top-full mt-2" : "bottom-full mb-2",
              align === "right" ? "right-0" : "left-0",
              direction === "down" && align === "right" && "origin-top-right",
              direction === "down" && align === "left" && "origin-top-left",
              direction === "up" && align === "right" && "origin-bottom-right",
              direction === "up" && align === "left" && "origin-bottom-left",
            )}
            role="menu"
          >
            {children}
          </div>
        )}
      </div>
    </MenuContext.Provider>
  );
}

interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  variant?: "default" | "danger" | "warning";
}

export function MenuItem({
  children,
  icon,
  variant = "default",
  className,
  onClick,
  ...props
}: MenuItemProps) {
  const context = useContext(MenuContext);

  return (
    <button
      onClick={(e) => {
        if (onClick) onClick(e);
        context?.close();
      }}
      className={cn(
        "disabled:opacity-50 disabled:cursor-not-allowed group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer",
        variant === "default" &&
          "text-primary-foreground hover:bg-neutral-800/50",
        variant === "danger" &&
          "text-red-400 hover:bg-red-500/10 hover:text-red-300",
        variant === "warning" &&
          "text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300",
        className,
      )}
      role="menuitem"
      {...props}
    >
      {icon && (
        <span className="w-4 h-4  opacity-70 group-hover:opacity-100 transition-opacity">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}
