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
} from "./file-sources";
import { skills } from "@/content/skills";
import { IDE_FILES } from "./files";
import { THEME_IDS, DEFAULT_THEME } from "./themes";
import esMessages from "../../messages/es.json";
import enMessages from "../../messages/en.json";

export type SearchLocale = "es" | "en";

interface MessagesDict {
  hero: { role: string; location: string };
  about: { title: string; p1: string; p2: string };
  experience: {
    items: { title: string; company: string; period: string; location: string; type: string; points: string[] }[];
  };
  studies: {
    items: { degree: string; institution: string; link: string; period: string; location: string; points: string[] }[];
  };
  projects: { featured: { title: string; tags: string[]; link: string }[] };
}

// Single place that turns a file id + locale into its display source.
// Used by /api/source (highlighted) and /api/search (plain text).
export function buildFileSource(
  fileId: string,
  locale: SearchLocale,
  theme: string = DEFAULT_THEME
): BuiltFileSource | null {
  if (!IDE_FILES.some((f) => f.id === fileId)) return null;
  const safeTheme = (THEME_IDS as string[]).includes(theme) ? theme : DEFAULT_THEME;
  const dict = (locale === "en" ? enMessages : esMessages) as MessagesDict;

  switch (fileId) {
    case "home":
      return homeTsx({ role: dict.hero.role, location: dict.hero.location });
    case "about":
      return aboutMd(dict.about.title, dict.about.p1, dict.about.p2);
    case "experience":
      return experienceJson(dict.experience.items);
    case "studies":
      return studiesMd(dict.studies.items);
    case "projects":
      return projectsJs(dict.projects.featured, locale);
    case "skills":
      return skillsTs([
        { key: "frontend", items: skills.frontend },
        { key: "backend", items: skills.backend },
        { key: "tools", items: skills.tools },
      ], locale);
    case "github":
      return githubMd(locale);
    case "contact":
      return contactCss(locale);
    default:
      return settingsJson(safeTheme, locale);
  }
}
