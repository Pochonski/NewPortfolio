import type { CSSProperties, ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const fg = { color: "var(--ide-fg)" };
const bright = { color: "var(--ide-fg-bright)" };
const dim = { color: "var(--ide-fg-dim)" };
const accent = { color: "var(--ide-accent)" };

function P({ children }: { children?: ReactNode }) {
  return (
    <p className="text-[15px] leading-relaxed" style={fg}>
      {children}
    </p>
  );
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold tracking-tight" style={bright}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-6 text-xl font-bold tracking-tight first:mt-0" style={bright}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-5 text-base font-semibold" style={bright}>
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-4 text-sm font-semibold" style={bright}>
      {children}
    </h4>
  ),
  p: P,
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="hover:underline"
        style={accent}
      >
        {children}
      </a>
    );
  },
  ul: ({ children }) => <ul className="flex list-disc flex-col gap-1.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="flex list-decimal flex-col gap-1.5 pl-5">{children}</ol>,
  li: ({ children }) => (
    <li className="text-sm leading-relaxed" style={fg}>
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="rounded-r-lg border-l-2 py-1 pr-3 pl-4 text-sm leading-relaxed"
      style={{ borderColor: "var(--ide-accent)", background: "var(--ide-terminal)", color: "var(--ide-fg)" }}
    >
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code
      className="rounded px-1.5 py-0.5 font-mono text-[0.85em]"
      style={{ background: "var(--ide-terminal)", color: "var(--ide-accent)" }}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre
      className="overflow-x-auto rounded-lg border p-4 font-mono text-[13px] leading-[1.7] ide-scroll"
      style={{ background: "var(--ide-terminal)", borderColor: "var(--ide-border)", color: "var(--ide-fg)" }}
    >
      {children}
    </pre>
  ),
  hr: () => <hr className="my-6 border-0 border-t" style={{ borderColor: "var(--ide-border)" }} />,
  strong: ({ children }) => (
    <strong className="font-semibold" style={bright}>
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em style={dim}>
      {children}
    </em>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto ide-scroll">
      <table className="w-full border-collapse text-sm" style={fg}>
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th
      className="border px-3 py-2 text-left font-mono text-xs"
      style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-bright)" }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border px-3 py-2" style={{ borderColor: "var(--ide-border)" }}>
      {children}
    </td>
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      className="h-16 w-16 rounded-full border object-cover"
      style={{ borderColor: "var(--ide-border)" }}
    />
  ),
};

// Renders a markdown source string exactly as the code pane shows it —
// literal "Markdown Preview" for .md files.
export function Markdown({ code }: { code: string }) {
  const wrap: CSSProperties = { color: "var(--ide-fg)" };
  return (
    <div className="flex flex-col gap-4" style={wrap}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {code}
      </ReactMarkdown>
    </div>
  );
}
