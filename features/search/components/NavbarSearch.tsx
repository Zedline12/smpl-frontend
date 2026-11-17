"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { SearchDialog } from "./SearchDialog";

/** Navbar search icon; also opens with Ctrl/⌘ + K from anywhere. */
export function NavbarSearch() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Never let the dialog survive a navigation (back/forward included).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        title="Search (Ctrl+K)"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="text-foreground/55 hover:text-foreground flex cursor-pointer items-center transition-colors"
      >
        <Search className="size-5" strokeWidth={1.5} />
      </button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
