import { IDE_FILES } from "./files";
import { contactInfo, socialLinks } from "@/content/site";
import type { Skill } from "@/content/skills";
import type { GithubRepo, GithubUser } from "./github";

// Code shown in the left pane of the split editor. Every builder generates
// source from the SAME data that renders the preview (messages / content),
// so code and preview can never drift — and both are bilingual.

export interface BuiltFileSource {
  filename: string;
  /** Display label, e.g. "TypeScript" */
  language: string;
  /** Shiki grammar id */
  shikiLang: string;
  code: string;
}

function pick(id: string, language: string, shikiLang: string, code: string): BuiltFileSource {
  const filename = IDE_FILES.find((f) => f.id === id)?.filename ?? `${id}.txt`;
  return { filename, language, shikiLang, code };
}

export function homeTsx(hero: { role: string; location: string }): BuiltFileSource {
  const code = `// portfolio/home.tsx — Joseph Fonseca
import { Profile, Links, Projects } from "@/components";

export const developer = {
  name: "Joseph Fonseca",
  role: ${JSON.stringify(hero.role)},
  location: ${JSON.stringify(hero.location)},
  stack: ["React", "Next.js", "TypeScript", "Supabase"],
  openToWork: true,
} as const;

export default function Home() {
  return (
    <main>
      <Profile name={developer.name} />
      <Links github="Pochonski" cv="/cv/Joseph-Fonseca-CV.pdf" />
      <Projects featured={4} />
    </main>
  );
}`;
  return pick("home", "TSX", "tsx", code);
}

export function aboutMd(title: string, p1: string, p2: string): BuiltFileSource {
  const code = `# ${title}\n\n${p1}\n\n${p2}\n\n- **Stack:** React · Next.js · Supabase · Vercel\n- **Base:** Costa Rica · Remoto\n- **Links:** [GitHub](https://github.com/Pochonski) · [LinkedIn](https://www.linkedin.com/in/joseph-fonseca-n)\n`;
  return pick("about", "Markdown", "markdown", code);
}

export interface ExpLite {
  title: string;
  company: string;
  period: string;
  location: string;
  type: string;
  points: string[];
}

export function experienceJson(items: ExpLite[]): BuiltFileSource {
  const slim = items.map((j) => ({
    role: j.title,
    company: j.company,
    period: j.period,
    location: j.location,
    type: j.type,
    highlights: j.points,
  }));
  return pick("experience", "JSON", "json", JSON.stringify(slim, null, 2));
}

export interface StudyLite {
  degree: string;
  institution: string;
  link: string;
  period: string;
  location: string;
  points: string[];
}

export function studiesMd(items: StudyLite[]): BuiltFileSource {
  const code =
    items
      .map(
        (s) =>
          `## ${s.degree}\n*[${s.institution}](${s.link}) — ${s.period} · ${s.location}*\n\n${s.points.map((p) => `- ${p}`).join("\n")}`
      )
      .join("\n\n---\n\n") + "\n";
  return pick("studies", "Markdown", "markdown", code);
}

export interface ProjectLite {
  title: string;
  tags: string[];
  link: string;
}

export function projectsJs(featured: ProjectLite[], locale: string): BuiltFileSource {
  const es = locale !== "en";
  const items = featured
    .map(
      (p) =>
        `  {\n    title: ${JSON.stringify(p.title)},\n    stack: ${JSON.stringify(p.tags)},\n    live: ${JSON.stringify(p.link)},\n  }`
    )
    .join(",\n");
  const code = es
    ? `// portfolio/projects.js — proyectos destacados
// archivo completo en github.com/Pochonski
export const projects = [\n${items},\n];\n`
    : `// portfolio/projects.js — featured work
// full archive lives on github.com/Pochonski
export const projects = [\n${items},\n];\n`;
  return pick("projects", "JavaScript", "javascript", code);
}

export function projectJsSingle(p: ProjectLite & { slug?: string }, locale: string): BuiltFileSource {
  const es = locale !== "en";
  const code = es
    ? `// portfolio/projects/${p.slug ?? "case"}.js — caso de estudio
export const project = {
  title: ${JSON.stringify(p.title)},
  stack: ${JSON.stringify(p.tags)},
  live: ${JSON.stringify(p.link)},
};
`
    : `// portfolio/projects/${p.slug ?? "case"}.js — case study
export const project = {
  title: ${JSON.stringify(p.title)},
  stack: ${JSON.stringify(p.tags)},
  live: ${JSON.stringify(p.link)},
};
`;
  return pick("projects", "JavaScript", "javascript", code);
}

export function skillsTs(groups: { key: string; items: Skill[] }[], locale: string): BuiltFileSource {
  const es = locale !== "en";
  const blocks = groups
    .map(
      (g) =>
        `export const ${g.key}: Skill[] = [\n${g.items.map((s) => `  { name: ${JSON.stringify(s.name)}, level: ${JSON.stringify(s.level)}, years: ${s.years} },`).join("\n")}\n];`
    )
    .join("\n\n");
  const code = es
    ? `// portfolio/skills.ts — niveles honestos, años de uso real
export type Level = "familiar" | "proficient" | "expert";

export interface Skill {
  name: string;
  level: Level;
  years: number;
}

${blocks}
`
    : `// portfolio/skills.ts — honest levels, years of real use
export type Level = "familiar" | "proficient" | "expert";

export interface Skill {
  name: string;
  level: Level;
  years: number;
}

${blocks}
`;
  return pick("skills", "TypeScript", "typescript", code);
}

export function githubMd(
  locale: string,
  data?: { user: GithubUser; repos: GithubRepo[] } | null
): BuiltFileSource {
  const es = locale === "es";
  const head = `# @Pochonski\n\n> ${es ? "Perfil y repositorios en vivo desde la API de GitHub." : "Live profile and repos from the GitHub API."}\n`;
  if (!data) {
    return pick(
      "github",
      "Markdown",
      "markdown",
      head +
        `\n- **Profile:** https://github.com/Pochonski\n- **Featured:** ScoreHub · StickerHub · Perfumes El Pocho · Préstamos Mi Príncipe\n- **Stack:** React · Next.js · Supabase\n`
    );
  }
  const { user, repos } = data;
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const featuredOrder = ["scorehub", "stickerhub", "perfumeselpocho", "prestamosmiprincipe"];
  const rank = (r: GithubRepo) => {
    const i = featuredOrder.indexOf(norm(r.name));
    return i === -1 ? featuredOrder.length : i;
  };
  const ordered = [...repos]
    .filter((r) => !r.fork)
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    );
  const relUpdated = (iso: string): string => {
    const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
    if (days < 1) return es ? "hoy" : "today";
    if (days < 2) return es ? "ayer" : "yesterday";
    if (days < 30) return es ? `hace ${days} días` : `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return es ? `hace ${months} ${months === 1 ? "mes" : "meses"}` : `${months} month${months === 1 ? "" : "s"} ago`;
    const years = Math.floor(months / 12);
    return es ? `hace ${years} ${years === 1 ? "año" : "años"}` : `${years} year${years === 1 ? "" : "s"} ago`;
  };
  const body = [
    `![${user.login}](${user.avatar_url})`,
    ``,
    `- **Repos:** ${user.public_repos} · **Followers:** ${user.followers} · **Stars:** ${stars}`,
    ``,
    `## Repos`,
    ...ordered.map(
      (r) =>
        `- [${r.name}](${r.html_url})${r.description ? ` — ${r.description}` : ""}${r.language ? ` \`(${r.language})\`` : ""} ★ ${r.stargazers_count} · ⑂ ${r.forks} · ${relUpdated(r.pushed_at)}`
    ),
    ``,
    `[${es ? "Ver perfil" : "View profile"}](https://github.com/${user.login})`,
  ].join("\n");
  return pick("github", "Markdown", "markdown", head + "\n" + body + "\n");
}

export function contactCss(locale: string): BuiltFileSource {
  const es = locale !== "en";
  const lines = [
    `  email: ${JSON.stringify(contactInfo.email)};`,
    ...socialLinks.map((s) => `  ${s.name.toLowerCase()}: ${JSON.stringify(s.url.replace("https://", "").replace("www.", ""))};`),
    `  location: ${JSON.stringify(contactInfo.location)};`,
  ];
  const code = es
    ? `/* portfolio/contact.css — escríbeme, respondo en 24h */
.socials {
${lines.join("\n")}
}
`
    : `/* portfolio/contact.css — write me, I reply within 24h */
.socials {
${lines.join("\n")}
}
`;
  return pick("contact", "CSS", "css", code);
}

export function settingsJsonString(theme: string, locale: string): string {
  return JSON.stringify({ theme, locale, terminal: true, palette: true, splitView: true }, null, 2);
}

export function settingsJson(theme: string, locale: string): BuiltFileSource {
  return pick("settings", "JSON", "json", settingsJsonString(theme, locale));
}
