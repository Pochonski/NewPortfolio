import { IDE_FILES } from "./files";
import { IDE_THEMES } from "./themes";
import { routing } from "@/i18n/routing";
import { contactInfo, socialLinks } from "@/content/site";
import { caseStudies } from "@/content/case-studies";
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

/**
 * home.tsx — Hero section of the portfolio.
 * Renders the profile, social links and the featured projects grid.
 * Server component · Bilingual via next-intl (es/en).
 */
export function homeTsx(hero: { role: string; location: string; featured: number }): BuiltFileSource {
  const socials = socialLinks.map((s) => `  ${s.name}: ${JSON.stringify(s.url)},`).join("\n");
  const code = `// portfolio/home.tsx — Joseph Fonseca
import { Profile, Links, Projects } from "@/components";

export const developer = {
  name: "Joseph Fonseca",
  role: ${JSON.stringify(hero.role)},
  location: ${JSON.stringify(hero.location)},
  // Core stack with years of real use (see skills.ts for the full inventory).
  stack: [
    { name: "React", years: 3 },
    { name: "Next.js", years: 2 },
    { name: "TypeScript", years: 2 },
    { name: "Supabase", years: 2 },
  ],
  openToWork: true,
} as const;

export const socials = {
${socials}
  email: ${JSON.stringify(contactInfo.email)},
} as const;

export const stats = {
  featuredProjects: ${hero.featured},
  caseStudies: ${Object.keys(caseStudies).length},
  ideThemes: ${IDE_THEMES.length},
  locales: ${JSON.stringify(routing.locales)},
} as const;

export default function Home() {
  return (
    <main>
      <Profile name={developer.name} />
      <Links github="Pochonski" cv="/cv/Joseph-Fonseca-CV.pdf" />
      <Projects featured={stats.featuredProjects} />
    </main>
  );
}`;
  return pick("home", "TSX", "tsx", code);
}

/**
 * about.md — Bio, values and interests.
 * Rendered as Markdown preview; source doubles as the canonical bio.
 */
export function aboutMd(title: string, p1: string, p2: string, locale: string): BuiltFileSource {
  const es = locale !== "en";
  const code = es
    ? `<!-- portfolio/about.md — bio, valores e intereses -->

# ${title}

${p1}

${p2}

## Valores

- **Código que se usa de verdad:** e-commerce, dashboards y bots en producción, no demos.
- **Documentar lo construido:** cada proyecto tiene caso de estudio y repo público.
- **Aprender rápido:** del scraper en Python al RLS multi-tenant en semanas.

## Intereses técnicos

- **Stack:** React · Next.js · TypeScript · Supabase · Vercel
- **Base:** Costa Rica · Remoto · TEC
- **Idiomas:** Español (nativo) · English (professional)
- **Links:** [GitHub](https://github.com/Pochonski) · [LinkedIn](https://www.linkedin.com/in/joseph-fonseca-n) · [Email](mailto:${contactInfo.email})
`
    : `<!-- portfolio/about.md — bio, values and interests -->

# ${title}

${p1}

${p2}

## Values

- **Code people actually use:** e-commerce, dashboards and bots in production, not demos.
- **Document what you build:** every project ships a case study and a public repo.
- **Learn fast:** from a Python scraper to multi-tenant RLS in weeks.

## Technical interests

- **Stack:** React · Next.js · TypeScript · Supabase · Vercel
- **Base:** Costa Rica · Remote · TEC
- **Languages:** Español (native) · English (professional)
- **Links:** [GitHub](https://github.com/Pochonski) · [LinkedIn](https://www.linkedin.com/in/joseph-fonseca-n) · [Email](mailto:${contactInfo.email})
`;
  return pick("about", "Markdown", "markdown", code);
}

export interface ExpLite {
  title: string;
  company: string;
  link?: string;
  period: string;
  location: string;
  type: string;
  points: string[];
}

/** Stack per workplace, kept next to the manifest (mirrors projects.js tags). */
const EXPERIENCE_STACK: Record<string, string[]> = {
  "ScoreHub (Proyecto Personal)": ["Next.js", "React", "Supabase", "Telegram API", "Gemini", "Tesseract.js"],
  "ScoreHub (Personal Project)": ["Next.js", "React", "Supabase", "Telegram API", "Gemini", "Tesseract.js"],
  "StickerHub (Proyecto Universitario)": ["Next.js 16", "TypeScript", "Supabase", "Tailwind"],
  "StickerHub (University Project)": ["Next.js 16", "TypeScript", "Supabase", "Tailwind"],
  "Perfumes El Pocho (Negocio propio)": ["Next.js", "Tailwind", "Python", "WhatsApp API"],
  "Perfumes El Pocho (Own business)": ["Next.js", "Tailwind", "Python", "WhatsApp API"],
};

/**
 * experience.json — Work experience as a JSON manifest.
 * Each entry links to the live project and lists its stack.
 */
export function experienceJson(items: ExpLite[]): BuiltFileSource {
  const slim = items.map((j) => ({
    role: j.title,
    company: j.company,
    ...(j.link ? { link: j.link } : {}),
    period: j.period,
    location: j.location,
    type: j.type,
    stack: EXPERIENCE_STACK[j.company] ?? [],
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

/**
 * studies.md — Education and certifications.
 * Rendered as Markdown preview; kept in sync with the studies page data.
 */
export function studiesMd(items: StudyLite[], locale: string): BuiltFileSource {
  const es = locale !== "en";
  const head = es
    ? "<!-- portfolio/studies.md — estudios y certificaciones -->\n\n"
    : "<!-- portfolio/studies.md — education and certifications -->\n\n";
  const code =
    head +
    items
      .map(
        (s) =>
          `## ${s.degree}\n*[${s.institution}](${s.link}) — ${s.period} · ${s.location}*\n\n${s.points.map((p) => `- ${p}`).join("\n")}`
      )
      .join("\n\n---\n\n") +
    (es
      ? `\n\n---\n\n- **Estado:** Ingeniería en curso (TEC) · Azure completado Nov 2025\n- **Foco:** software, algoritmos y estructuras de datos\n`
      : `\n\n---\n\n- **Status:** Engineering in progress (TEC) · Azure completed Nov 2025\n- **Focus:** software, algorithms and data structures\n`);
  return pick("studies", "Markdown", "markdown", code);
}

export interface ProjectLite {
  slug?: string;
  title: string;
  description?: string;
  tags: string[];
  link: string;
  github?: string;
}

/** Ship year per project slug (from experience periods; prestamos inferred). */
const PROJECT_YEAR: Record<string, number> = {
  "perfumes-el-pocho": 2026,
  "prestamos-mi-principe": 2025,
  scorehub: 2026,
  stickerhub: 2026,
};

/** Role per project slug (stickerhub was a 2-person team, rest solo). */
const PROJECT_ROLE: Record<string, string> = {
  "perfumes-el-pocho": "solo",
  "prestamos-mi-principe": "solo",
  scorehub: "solo",
  stickerhub: "lead",
};

/**
 * projects.js — Featured + archive projects.
 * Each entry carries year, role, highlights (from case studies),
 * techs, live URL and repo. Full archive lives on GitHub.
 */
export function projectsJs(featured: ProjectLite[], locale: string): BuiltFileSource {
  const es = locale !== "en";
  const lang = es ? "es" : "en";
  const items = featured
    .map((p) => {
      const study = p.slug ? caseStudies[p.slug] : undefined;
      const highlights = study ? study.results[lang] : [];
      const fields = [
        `    title: ${JSON.stringify(p.title)}`,
        `    year: ${PROJECT_YEAR[p.slug ?? ""] ?? "null"}`,
        `    role: ${JSON.stringify(PROJECT_ROLE[p.slug ?? ""] ?? "solo")}`,
        `    stack: ${JSON.stringify(p.tags)}`,
        `    live: ${JSON.stringify(p.link)}`,
        ...(p.github ? [`    repo: ${JSON.stringify(p.github)}`] : []),
        ...(highlights.length > 0
          ? [`    highlights: [\n${highlights.map((h) => `      ${JSON.stringify(h)},`).join("\n")}\n    ]`]
          : []),
      ];
      return `  {\n${fields.join(",\n")},\n  }`;
    })
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

/**
 * projectJsSingle — Single-project manifest for case-study pages.
 * Highlights come from the case study results (same data as the preview).
 */
export function projectJsSingle(p: ProjectLite & { slug?: string }, locale: string): BuiltFileSource {
  const es = locale !== "en";
  const lang = es ? "es" : "en";
  const study = p.slug ? caseStudies[p.slug] : undefined;
  const highlights = study ? study.results[lang] : [];
  const fields = [
    `  title: ${JSON.stringify(p.title)}`,
    `  year: ${PROJECT_YEAR[p.slug ?? ""] ?? "null"}`,
    `  role: ${JSON.stringify(PROJECT_ROLE[p.slug ?? ""] ?? "solo")}`,
    `  stack: ${JSON.stringify(p.tags)}`,
    `  live: ${JSON.stringify(p.link)}`,
    ...(p.github ? [`  repo: ${JSON.stringify(p.github)}`] : []),
    ...(p.slug ? [`  caseStudy: ${JSON.stringify(`/projects/${p.slug}`)}`] : []),
    ...(highlights.length > 0
      ? [`  highlights: [\n${highlights.map((h) => `    ${JSON.stringify(h)},`).join("\n")}\n  ]`]
      : []),
  ];
  const code = es
    ? `// portfolio/projects/${p.slug ?? "case"}.js — caso de estudio
export const project = {
${fields.join(",\n")},
};
`
    : `// portfolio/projects/${p.slug ?? "case"}.js — case study
export const project = {
${fields.join(",\n")},
};
`;
  return pick("projects", "JavaScript", "javascript", code);
}

/** Most recent project where each skill shipped (by slug; omitted when unclear). */
const SKILL_LAST_USED: Record<string, string> = {
  React: "scorehub",
  "Next.js": "stickerhub",
  TypeScript: "stickerhub",
  "Tailwind CSS": "perfumes-el-pocho",
  "HTML5 / CSS3": "perfumes-el-pocho",
  "Node.js": "scorehub",
  "Supabase / PostgreSQL": "scorehub",
  Python: "perfumes-el-pocho",
  "REST / RLS": "prestamos-mi-principe",
  "Vercel CI/CD": "stickerhub",
  Vite: "prestamos-mi-principe",
  "Git / GitHub": "stickerhub",
};

/**
 * skills.ts — Honest levels, years of real use, last project shipped.
 * Mirrors src/content/skills.ts so code and preview can never drift.
 */
export function skillsTs(groups: { key: string; items: Skill[] }[], locale: string): BuiltFileSource {
  const es = locale !== "en";
  const blocks = groups
    .map(
      (g) =>
        `export const ${g.key}: Skill[] = [\n${g.items
          .map((s) => {
            const lastUsed = SKILL_LAST_USED[s.name];
            return `  { name: ${JSON.stringify(s.name)}, level: ${JSON.stringify(s.level)}, years: ${s.years}${lastUsed ? `, lastUsed: ${JSON.stringify(lastUsed)}` : ""} },`;
          })
          .join("\n")}\n];`
    )
    .join("\n\n");
  const code = es
    ? `// portfolio/skills.ts — niveles honestos, años de uso real
export type Level = "familiar" | "proficient" | "expert";

export interface Skill {
  name: string;
  level: Level;
  years: number;
  /** Slug del último proyecto donde se usó (ver projects.js). */
  lastUsed?: string;
}

${blocks}
`
    : `// portfolio/skills.ts — honest levels, years of real use
export type Level = "familiar" | "proficient" | "expert";

export interface Skill {
  name: string;
  level: Level;
  years: number;
  /** Slug of the last project where it shipped (see projects.js). */
  lastUsed?: string;
}

${blocks}
`;
  return pick("skills", "TypeScript", "typescript", code);
}

/**
 * github.md — Live GitHub profile + repos from the GitHub API.
 * Repos are ranked by featuredOrder, then by push date; forks excluded.
 */
export function githubMd(
  locale: string,
  data?: { user: GithubUser; repos: GithubRepo[] } | null
): BuiltFileSource {
  const es = locale === "es";
  const head = `<!-- portfolio/github.md — generated from api.github.com/users/Pochonski -->\n\n# @Pochonski\n\n> ${es ? "Perfil y repositorios en vivo desde la API de GitHub." : "Live profile and repos from the GitHub API."}\n`;
  if (!data) {
    return pick(
      "github",
      "Markdown",
      "markdown",
      head +
        `\n- **Profile:** https://github.com/Pochonski\n- **Featured:** Perfumes El Pocho · Préstamos Mi Príncipe · StickerHub · FetchCPU-Pocho · ScoreHub · NewPortfolio\n- **Stack:** React · Next.js · Supabase\n`
    );
  }
  const { user, repos } = data;
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const featuredOrder = [
    "perfumeselpocho",
    "prestamosmiprincipe",
    "stickerhub",
    "fetchcpupocho",
    "scorehub",
    "newportfolio",
  ];
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
  const L = {
    repos: es ? "Repositorios" : "Repos",
    followers: es ? "Seguidores" : "Followers",
    stars: es ? "Estrellas" : "Stars",
    reposTitle: es ? "Repositorios" : "Repos",
    viewProfile: es ? "Ver perfil" : "View profile",
  };
  const body = [
    `![${user.login}](${user.avatar_url})`,
    ``,
    `- **${L.repos}:** ${user.public_repos} · **${L.followers}:** ${user.followers} · **${L.stars}:** ${stars}`,
    ``,
    `## ${L.reposTitle}`,
    ...ordered.map(
      (r) =>
        `- [${r.name}](${r.html_url})${r.description ? ` — ${r.description}` : ""}${r.language ? ` \`(${r.language})\`` : ""} ★ ${r.stargazers_count} · ⑂ ${r.forks} · ${relUpdated(r.pushed_at)}`
    ),
    ``,
    `[${L.viewProfile}](https://github.com/${user.login})`,
  ].join("\n");
  return pick("github", "Markdown", "markdown", head + "\n" + body + "\n");
}

/**
 * contact.css — Contact form stylesheet.
 * Socials, fields with focus states, submit button and a mobile breakpoint.
 */
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

/* Campos del formulario: fondo terminal + anillo accent en foco */
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  background: var(--ide-terminal);
  border: 1px solid var(--ide-border);
  border-radius: 6px;
  padding: 0.625rem 0.75rem;
  color: var(--ide-fg-bright);
}

.field:focus {
  border-color: var(--ide-accent);
  box-shadow: 0 0 0 3px rgba(var(--ide-accent-rgb), 0.16);
  outline: none;
}

.button {
  background: var(--ide-button);
  color: var(--ide-button-fg);
  box-shadow: 0 8px 24px rgba(var(--ide-accent-rgb), 0.3);
}

.button:hover {
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .form { gap: 0.75rem; }
}
`
    : `/* portfolio/contact.css — write me, I reply within 24h */
.socials {
${lines.join("\n")}
}

/* Form fields: terminal background + accent ring on focus */
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  background: var(--ide-terminal);
  border: 1px solid var(--ide-border);
  border-radius: 6px;
  padding: 0.625rem 0.75rem;
  color: var(--ide-fg-bright);
}

.field:focus {
  border-color: var(--ide-accent);
  box-shadow: 0 0 0 3px rgba(var(--ide-accent-rgb), 0.16);
  outline: none;
}

.button {
  background: var(--ide-button);
  color: var(--ide-button-fg);
  box-shadow: 0 8px 24px rgba(var(--ide-accent-rgb), 0.3);
}

.button:hover {
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .form { gap: 0.75rem; }
}
`;
  return pick("contact", "CSS", "css", code);
}

export function settingsJsonString(theme: string, locale: string): string {
  return JSON.stringify({ theme, locale, terminal: true, palette: true, splitView: true }, null, 2);
}

/**
 * settings.json — Runtime settings: theme, locale and IDE preferences.
 * These are the keys the settings page actually persists (see storage-keys.ts
 * for the remaining stores: recents, panel, sidebar, terminal history).
 */
export function settingsJson(theme: string, locale: string): BuiltFileSource {
  return pick("settings", "JSON", "json", settingsJsonString(theme, locale));
}

/**
 * README.md — Portfolio readme: intro, stack, projects, run locally.
 * Lives in docs/ next to about.md; opens as a code tab (no route page).
 */
export function readmeMd(locale: string): BuiltFileSource {
  const es = locale !== "en";
  const code = es
    ? `<!-- portfolio/README.md — léeme del portafolio -->

# Joseph Fonseca — Portfolio

> ${"Ingeniero de Software — Full-Stack React, Next.js & Supabase. Costa Rica · Remoto."}

Portafolio con forma de IDE: explorador de archivos, editor con tabs,
navegador interno con 4 proyectos en vivo, terminal funcional y 5 temas.

## Stack

- **Frontend:** React · Next.js 16 · TypeScript · Tailwind CSS
- **Backend:** Supabase · PostgreSQL · Python
- **Deploy:** Vercel CI/CD · GitHub

## Proyectos destacados

| Proyecto | Live | Repo |
| --- | --- | --- |
| Perfumes El Pocho | https://perfumes-el-pocho.vercel.app/ | https://github.com/Pochonski/PerfumesElPocho |
| Préstamos Mi Príncipe | https://prestamos-mi-principe.vercel.app | https://github.com/Pochonski/PrestamosMiPrincipe |
| ScoreHub | https://scorehub-pocho.vercel.app | https://github.com/Pochonski/ScoreHub |
| StickerHub | https://stickerhubs.vercel.app/ | https://github.com/Pochonski/stickerhub |

Ver \`projects.js\` para el manifiesto completo y \`/projects/[slug]\` para casos de estudio.

## Ejecutar localmente

\`\`\`bash
npm install
npm run dev    # http://localhost:3000
\`\`\`

## Explorar este IDE

- \`home.tsx\` — hero y métricas
- \`about.md\` — bio, valores e intereses
- \`experience.json\` — experiencia como manifiesto
- \`skills.ts\` — niveles honestos con años de uso
- \`projects/\` — archivos \`.project\` ejecutables (doble uso: abren el navegador interno)

## Contacto

- **Email:** ${contactInfo.email}
- **GitHub:** https://github.com/Pochonski
- **LinkedIn:** https://www.linkedin.com/in/joseph-fonseca-n
`
    : `<!-- portfolio/README.md — portfolio readme -->

# Joseph Fonseca — Portfolio

> ${"Software Engineer — Full-Stack React, Next.js & Supabase. Costa Rica · Remote."}

Portfolio shaped as an IDE: file explorer, tabbed editor,
built-in browser with 4 live projects, working terminal and 5 themes.

## Stack

- **Frontend:** React · Next.js 16 · TypeScript · Tailwind CSS
- **Backend:** Supabase · PostgreSQL · Python
- **Deploy:** Vercel CI/CD · GitHub

## Featured projects

| Project | Live | Repo |
| --- | --- | --- |
| Perfumes El Pocho | https://perfumes-el-pocho.vercel.app/ | https://github.com/Pochonski/PerfumesElPocho |
| Préstamos Mi Príncipe | https://prestamos-mi-principe.vercel.app | https://github.com/Pochonski/PrestamosMiPrincipe |
| ScoreHub | https://scorehub-pocho.vercel.app | https://github.com/Pochonski/ScoreHub |
| StickerHub | https://stickerhubs.vercel.app/ | https://github.com/Pochonski/stickerhub |

See \`projects.js\` for the full manifest and \`/projects/[slug]\` for case studies.

## Run locally

\`\`\`bash
npm install
npm run dev    # http://localhost:3000
\`\`\`

## Explore this IDE

- \`home.tsx\` — hero and metrics
- \`about.md\` — bio, values and interests
- \`experience.json\` — experience as a manifest
- \`skills.ts\` — honest levels with years of use
- \`projects/\` — executable \`.project\` files (double duty: they open the built-in browser)

## Contact

- **Email:** ${contactInfo.email}
- **GitHub:** https://github.com/Pochonski
- **LinkedIn:** https://www.linkedin.com/in/joseph-fonseca-n
`;
  return pick("readme", "Markdown", "markdown", code);
}
