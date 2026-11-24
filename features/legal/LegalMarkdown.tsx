import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

/** Renders a legal document's markdown with readable, consistent styles. */
export function LegalMarkdown({ body }: { body: string }) {
  return (
    <div className="text-[15px] leading-7 text-white/75">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="mb-6 text-3xl font-bold text-white">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-10 mb-3 text-xl font-semibold text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-6 mb-2 text-lg font-semibold text-white">{children}</h3>,
          p: ({ children }) => <p className="my-3">{children}</p>,
          ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-6">{children}</ol>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          a: ({ href, children }) =>
            href?.startsWith("/") ? (
              <Link href={href} className="text-white underline underline-offset-2 hover:text-white/80">
                {children}
              </Link>
            ) : (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2">
                {children}
              </a>
            ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full text-left text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border-b border-white/10 bg-white/[0.03] px-3 py-2 font-medium text-white">{children}</th>,
          td: ({ children }) => <td className="border-b border-white/5 px-3 py-2 align-top">{children}</td>,
          code: ({ children }) => <code className="rounded bg-white/10 px-1 py-0.5 text-[13px] text-white">{children}</code>,
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
