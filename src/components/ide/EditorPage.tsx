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
  title: string;
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
