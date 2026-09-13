import { SplitView } from "./SplitView";
import { RegisterSource } from "./editors-context";

export interface EditorInitialSource {
  fileId: string;
  code: string;
  codeHtml?: string;
}

// Full-bleed editor surface: groups touch the edges like real VS Code.
// The h1 stays for SEO/screen readers but is visually hidden — the file
// identity lives in tabs + breadcrumbs.
export function EditorPage({
  title,
  initialSource,
  children,
}: {
  route: string;
  title: string;
  subtitle?: string;
  initialSource: EditorInitialSource;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <h1 className="sr-only">{title}</h1>
      <RegisterSource
        fileId={initialSource.fileId}
        code={initialSource.code}
        codeHtml={initialSource.codeHtml}
      />
      <SplitView preview={children} />
    </div>
  );
}

export function CodeCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{ background: "var(--ide-terminal)", borderColor: "var(--ide-border)" }}
    >
      <div
        className="flex items-center gap-1.5 border-b px-3 py-2"
        style={{ borderColor: "var(--ide-border)" }}
        aria-hidden
      >
        <i className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <i className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <i className="h-2 w-2 rounded-full bg-[#28c840]" />
      </div>
      <div className="p-4 font-mono text-[13px] leading-6" style={{ color: "var(--ide-fg)" }}>
        {children}
      </div>
    </div>
  );
}
