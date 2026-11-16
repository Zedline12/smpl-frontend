import Link from "next/link";
import type { ReactNode } from "react";

/** Site paths go through next/link; other URLs open in a new tab. No href: just the children. */
export function SmartLink({ href, className, children }: { href?: string; className?: string; children: ReactNode }) {
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith("/"))
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
