export interface IdeFile {
  id: string;
  filename: string;
  route: string;
  /** kind drives the file icon color/letter */
  kind: "tsx" | "md" | "json" | "js" | "ts" | "css";
}

export const IDE_FILES: IdeFile[] = [
  { id: "home", filename: "home.tsx", route: "/", kind: "tsx" },
  { id: "about", filename: "about.md", route: "/about", kind: "md" },
  { id: "experience", filename: "experience.json", route: "/experience", kind: "json" },
  { id: "studies", filename: "studies.md", route: "/studies", kind: "md" },
  { id: "projects", filename: "projects.js", route: "/projects", kind: "js" },
  { id: "skills", filename: "skills.ts", route: "/skills", kind: "ts" },
  { id: "github", filename: "github.md", route: "/github", kind: "md" },
  { id: "contact", filename: "contact.css", route: "/contact", kind: "css" },
  { id: "settings", filename: "settings.json", route: "/settings", kind: "json" },
];

export const KIND_COLORS: Record<IdeFile["kind"], string> = {
  tsx: "#61afef",
  md: "#7ee787",
  json: "#e6b450",
  js: "#e8d44d",
  ts: "#61afef",
  css: "#7aa2f7",
};

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
