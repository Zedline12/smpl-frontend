import Link from "next/link";

const legalLinks = [
  { href: "https://smplcontent.com/privacy-policy", label: "Privacy Policy" },
  { href: "https://smplcontent.com/terms", label: "Terms of Service" },
  { href: "https://smplcontent.com/refund-policy", label: "Refund Policy" },
  { href: "https://smplcontent.com/acceptable-use-policy", label: "Acceptable Use" },
  { href: "https://smplcontent.com/copyright-policy", label: "Copyright Policy" },
  { href: "https://smplcontent.com/cookie-policy", label: "Cookie Policy" },
];

const resourceLinks = [
  { href: "https://smplcontent.com/#faq", label: "FAQ" },
  { href: "https://smplcontent.com/blog", label: "Blog" },
];

export default function Footer() {
  return (
    <footer className="z-100 w-full bg-background border-t border-border py-8 px-4 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12">
        <div className="flex-shrink-0">
          <p className="text-foreground text-sm font-medium">
            © {new Date().getFullYear()} SmplContent
          </p>
          <p className="text-foreground/60 text-xs mt-1">
            All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 md:gap-12">
          <div>
            <p className="text-foreground/50 text-xs font-semibold uppercase tracking-wider mb-3">
              Resources
            </p>
            <ul className="flex flex-col gap-2">
              {resourceLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground text-sm font-medium hover:text-primary-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-foreground/50 text-xs font-semibold uppercase tracking-wider mb-3">
              Legal
            </p>
            <ul className="flex flex-col gap-2">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground text-sm font-medium hover:text-primary-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
