export type FolderIconKind = "src" | "docs" | "database" | "css" | "config" | "link";

export interface IdeFolder {
  id: string;
  name: string;
  icon: FolderIconKind;
}

export interface IdeFile {
  id: string;
  filename: string;
  route: string;
  /** kind drives the language label + fallback icon */
  kind: "tsx" | "md" | "json" | "js" | "ts" | "css";
  /** folder group shown in the Explorer tree */
  folder: string;
}

export const IDE_FOLDERS: IdeFolder[] = [
  { id: "src", name: "src", icon: "src" },
  { id: "docs", name: "docs", icon: "docs" },
  { id: "data", name: "data", icon: "database" },
  { id: "styles", name: "styles", icon: "css" },
  { id: "projects", name: "projects", icon: "link" },
];

export const IDE_FILES: IdeFile[] = [
  { id: "home", filename: "home.tsx", route: "/", kind: "tsx", folder: "src" },
  // README has no route-backed page: it opens as a code tab via
  // porto-open-file (see Explorer renderFile + CommandPalette nav).
  { id: "readme", filename: "README.md", route: "/readme", kind: "md", folder: "docs" },
  { id: "about", filename: "about.md", route: "/about", kind: "md", folder: "docs" },
  { id: "experience", filename: "experience.json", route: "/experience", kind: "json", folder: "data" },
  { id: "studies", filename: "studies.md", route: "/studies", kind: "md", folder: "docs" },
  { id: "projects", filename: "projects.js", route: "/projects", kind: "js", folder: "src" },
  { id: "skills", filename: "skills.ts", route: "/skills", kind: "ts", folder: "src" },
  { id: "github", filename: "github.md", route: "/github", kind: "md", folder: "docs" },
  { id: "contact", filename: "contact.css", route: "/contact", kind: "css", folder: "styles" },
  { id: "settings", filename: "settings.json", route: "/settings", kind: "json", folder: "data" },
];

export const KIND_LANGUAGE: Record<IdeFile["kind"], string> = {
  tsx: "TypeScript React",
  ts: "TypeScript",
  js: "JavaScript",
  json: "JSON",
  md: "Markdown",
  css: "CSS",
};

export function fileForRoute(pathname: string): IdeFile {
  const clean = pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/";
  return IDE_FILES.find((f) => f.route === clean) ?? IDE_FILES[0];
}

// ---------------------------------------------------------------------------
// Live sites: external projects opened in the integrated browser (SiteBrowser
// tab). Only the portfolio's own live projects may be framed. Not part of
// IDE_FILES — sites have no route, code pane or search index.
// ---------------------------------------------------------------------------

export interface IdeSite {
  id: string;
  /** Explorer row label (proper noun, not translated). Kept for semantic uses
   *  (iframe title, SiteBrowser label, command palette display). */
  label: string;
  /** Visual filename shown in the Explorer (e.g. "perfumes-el-pocho.project").
   *  Falls back to `label + ".project"` when not provided. */
  displayFilename?: string;
  url: string;
}

export const IDE_SITES: IdeSite[] = [
  {
    id: "site-perfumes",
    label: "Perfumes El Pocho",
    displayFilename: "perfumes-el-pocho.project",
    url: "https://perfumes-el-pocho.vercel.app/",
  },
  {
    id: "site-prestamos",
    label: "Préstamos Mi Príncipe",
    displayFilename: "prestamos-mi-principe.project",
    url: "https://prestamos-mi-principe.vercel.app",
  },
  {
    id: "site-scorehub",
    label: "ScoreHub",
    displayFilename: "scorehub.project",
    url: "https://scorehub-pocho.vercel.app",
  },
  {
    id: "site-stickerhub",
    label: "StickerHub",
    displayFilename: "stickerhub.project",
    url: "https://stickerhubs.vercel.app/",
  },
];

/** Display filename for the Explorer (always ends with `.project`). */
export function siteDisplayFilename(site: IdeSite): string {
  return site.displayFilename ?? `${site.label}.project`;
}

export function siteForId(siteId: string): IdeSite | undefined {
  return IDE_SITES.find((s) => s.id === siteId);
}

/** Host shown as the browser tab label, e.g. "perfumes-el-pocho.vercel.app". */
export function siteHost(site: IdeSite): string {
  try {
    return new URL(site.url).host;
  } catch {
    return site.label;
  }
}
