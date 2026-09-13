import { NextResponse } from "next/server";
import { highlightCode } from "@/lib/shiki";
import {
  homeTsx,
  aboutMd,
  experienceJson,
  studiesMd,
  projectsJs,
  skillsTs,
  githubMd,
  contactCss,
  settingsJson,
  type BuiltFileSource,
} from "@/lib/file-sources";
import { skills } from "@/content/skills";
import { IDE_FILES } from "@/lib/files";
import { THEME_IDS, DEFAULT_THEME } from "@/lib/themes";
import esMessages from "../../../../messages/es.json";
import enMessages from "../../../../messages/en.json";

// On-demand file sources for editor groups showing files other than the
// current route. Responses are cacheable; highlights are identical across
// IDE themes (css-variables), only `settings` varies by theme (content).
const mem = new Map<string, BuiltFileSource & { codeHtml: string }>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("file") ?? "";
  const rawLocale = searchParams.get("locale");
  const rawTheme = searchParams.get("theme") ?? "";
  const locale = rawLocale === "en" ? "en" : "es";
  const theme = (THEME_IDS as string[]).includes(rawTheme) ? rawTheme : DEFAULT_THEME;

  if (!IDE_FILES.some((f) => f.id === fileId)) {
    return NextResponse.json({ error: "unknown file" }, { status: 400 });
  }

  const key = `${locale}:${fileId}:${fileId === "settings" ? theme : ""}`;
  const hit = mem.get(key);
  if (hit) {
    return NextResponse.json(hit, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate" },
    });
  }

  const dict = (locale === "en" ? enMessages : esMessages) as {
    hero: { role: string; location: string };
    about: { title: string; p1: string; p2: string };
    experience: { items: { title: string; company: string; period: string; location: string; type: string; points: string[] }[] };
    studies: { items: { degree: string; institution: string; period: string; location: string; points: string[] }[] };
    projects: { featured: { title: string; tags: string[]; link: string }[] };
  };

  let src: BuiltFileSource;
  switch (fileId) {
    case "home":
      src = homeTsx({ role: dict.hero.role, location: dict.hero.location });
      break;
    case "about":
      src = aboutMd(dict.about.title, dict.about.p1, dict.about.p2);
      break;
    case "experience":
      src = experienceJson(dict.experience.items);
      break;
    case "studies":
      src = studiesMd(dict.studies.items);
      break;
    case "projects":
      src = projectsJs(dict.projects.featured);
      break;
    case "skills":
      src = skillsTs([
        { key: "frontend", items: skills.frontend },
        { key: "backend", items: skills.backend },
        { key: "tools", items: skills.tools },
      ]);
      break;
    case "github":
      src = githubMd(locale);
      break;
    case "contact":
      src = contactCss();
      break;
    default:
      src = settingsJson(theme, locale);
      break;
  }

  const payload = { ...src, codeHtml: await highlightCode(src.code, src.shikiLang) };
  mem.set(key, payload);
  return NextResponse.json(payload, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate" },
  });
}
