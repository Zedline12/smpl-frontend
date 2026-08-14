"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Assistant replies only. `react-markdown` does not render raw HTML unless
 * `rehype-raw` is added (it deliberately is not), and it sanitizes `javascript:`
 * URLs, so model output is safe to render.
 *
 * Styling goes through this override map because the project has no
 * `@tailwindcss/typography` plugin.
 */
export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="text-sm leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          strong: ({ children }) => (
            <strong className="text-foreground font-semibold">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            const isBlock = (className ?? "").includes("language-");
            if (isBlock) {
              return (
                <code className="font-mono text-xs">{children}</code>
              );
            }
            return (
              <code className="bg-background-lighter rounded px-1 py-0.5 font-mono text-[0.8em]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-background-dark custom-scrollbar mb-2 overflow-x-auto rounded-lg p-3 last:mb-0">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-border text-muted-foreground mb-2 border-l-2 pl-3 last:mb-0">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <h1 className="mb-2 text-base font-semibold last:mb-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 text-sm font-semibold last:mb-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 text-sm font-semibold last:mb-0">{children}</h3>
          ),
          hr: () => <hr className="border-border my-3" />,
          table: ({ children }) => (
            <div className="custom-scrollbar mb-2 overflow-x-auto last:mb-0">
              <table className="w-full text-left text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-border border-b px-2 py-1 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-border/50 border-b px-2 py-1">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
