import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-transparent border-t border-white/20 py-6 px-4 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-secondary-foreground text-sm font-medium">
          © {new Date().getFullYear()} SmplContent. All rights reserved.
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
          <Link
            href="https://smplcontent.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary-foreground hover:text-primary-foreground transition-colors"
          >
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
