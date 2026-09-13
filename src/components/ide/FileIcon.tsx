import type { IdeFile } from "@/lib/files";
import {
  CssIcon,
  FolderConfigIcon,
  FolderCssIcon,
  FolderDatabaseIcon,
  FolderDocsIcon,
  FolderSrcIcon,
  JavaScriptIcon,
  JsonIcon,
  MarkdownIcon,
  ReactIcon,
  TypeScriptIcon,
} from "./icons";
import type { FolderIconKind } from "@/lib/files";

function IconForFilename({ filename, size }: { filename: string; size: number }) {
  const lower = filename.toLowerCase();
  // VS Code Material Icon Theme resolves by exact file name first, then
  // by extension — replicate that for the 9 portfolio files.
  if (lower.endsWith(".tsx") || lower.endsWith(".jsx")) return <ReactIcon size={size} />;
  if (lower.endsWith(".ts")) return <TypeScriptIcon size={size} />;
  if (lower.endsWith(".js")) return <JavaScriptIcon size={size} />;
  if (lower.endsWith(".json")) return <JsonIcon size={size} />;
  if (lower.endsWith(".md")) return <MarkdownIcon size={size} />;
  if (lower.endsWith(".css")) return <CssIcon size={size} />;
  return <ReactIcon size={size} />;
}

/** VS Code-style file icon (Material Icon Theme artwork, vendored). */
export function FileIcon({
  file,
  filename,
  size = 16,
}: {
  file?: IdeFile;
  filename?: string;
  size?: number;
}) {
  const name = filename ?? file?.filename ?? "file";
  return <IconForFilename filename={name} size={size} />;
}

/** VS Code-style folder icon with open/closed state. */
export function FolderIcon({
  kind,
  open,
  size = 16,
}: {
  kind: FolderIconKind;
  open?: boolean;
  size?: number;
}) {
  switch (kind) {
    case "src":
      return <FolderSrcIcon open={open} size={size} />;
    case "docs":
      return <FolderDocsIcon open={open} size={size} />;
    case "database":
      return <FolderDatabaseIcon open={open} size={size} />;
    case "css":
      return <FolderCssIcon open={open} size={size} />;
    case "config":
      return <FolderConfigIcon open={open} size={size} />;
  }
}
