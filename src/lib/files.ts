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
  const found = IDE_FILES.find((f) => f.route === clean);
  if (found) return found;
  // Unknown routes fall back to home for the IDE chrome; the global
  // not-found page still handles the actual 404.
  const home = IDE_FILES[0];
  if (!home) throw new Error("IDE_FILES must not be empty");
  return home;
}

// ---------------------------------------------------------------------------
// Live sites: external projects opened in the integrated browser. Only the
// portfolio's own projects may be framed. They use virtual routes, but are
// not code files or part of the source search index.
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
  {
    id: "site-fetchcpu",
    label: "FetchCPU",
    displayFilename: "fetchcpu.project",
    url: "https://fetchcpu-pocho.vercel.app/",
  },
];

/** Display filename for the Explorer (always ends with `.project`). */
export function siteDisplayFilename(site: IdeSite): string {
  return site.displayFilename ?? `${site.label}.project`;
}

export function siteForId(siteId: string): IdeSite | undefined {
  return IDE_SITES.find((s) => s.id === siteId);
}

/**
 * Single source for the frame-src allowlist (next.config.ts CSP).
 * Keep in sync: SiteBrowser may only frame these origins.
 */
export const IDE_FRAME_ORIGINS: string[] = [
  "https://perfumes-el-pocho.vercel.app",
  "https://prestamos-mi-principe.vercel.app",
  "https://scorehub-pocho.vercel.app",
  "https://stickerhubs.vercel.app",
  "https://fetchcpu-pocho.vercel.app",
];

/** Host shown as the browser tab label, e.g. "perfumes-el-pocho.vercel.app". */
export function siteHost(site: IdeSite): string {
  try {
    return new URL(site.url).host;
  } catch {
    return site.label;
  }
}

/** Resolve a portfolio path to one of the configured embedded projects. */
export function siteFromVirtualPath(pathname: string): { site: IdeSite; href: string } | null {
  const clean = pathname.replace(/^\/(?:es|en)(?=\/|$)/, "") || "/";
  const [host, ...segments] = clean.slice(1).split("/");
  const site = IDE_SITES.find((candidate) => siteHost(candidate) === host);
  if (!site) return null;

  const path = segments.length ? `/${segments.join("/")}` : "/";
  try {
    const origin = new URL(site.url).origin;
    const url = new URL(path, origin);
    if (url.origin !== origin || url.search || url.hash) return null;
    return { site, href: url.origin + url.pathname };
  } catch {
    return null;
  }
}

/** Map a trusted project's URL to its portfolio path, without search or hash. */
export function virtualPathForSiteUrl(href: string, locale: "es" | "en" = "es"): string | null {
  try {
    const url = new URL(href);
    const site = IDE_SITES.find((candidate) => new URL(candidate.url).origin === url.origin);
    if (!site) return null;
    const prefix = locale === "en" ? "/en" : "";
    return `${prefix}/${siteHost(site)}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return null;
  }
}
