import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { projectsJs } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";
import { ExternalLink, Github } from "lucide-react";

interface Project {
  slug?: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  github: string;
}

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="flex flex-col rounded-lg border p-5" style={{ borderColor: "var(--ide-border)", background: "var(--ide-terminal)" }}>
      <h2 className="text-base font-semibold" style={{ color: "var(--ide-fg-bright)" }}>{p.title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: "var(--ide-fg)" }}>{p.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.tags.map((tag) => (
          <span key={tag} className="rounded border px-2 py-0.5 font-mono text-[11px]" style={{ borderColor: "var(--ide-border)", color: "var(--ide-accent)" }}>
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-4 text-[13px] font-medium">
        <a href={p.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline" style={{ color: "var(--ide-accent)" }}>
          Live <ExternalLink size={13} />
        </a>
        <a href={p.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline" style={{ color: "var(--ide-fg-dim)" }}>
          <Github size={14} /> Code
        </a>
      </div>
    </article>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  return { title: "projects.js", description: t("projects.subtitle") };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const featured = t.raw("projects.featured") as Project[];
  const archive = t.raw("projects.archive") as Project[];
  const src = projectsJs(featured);

  return (
    <EditorPage
      route="/projects"
      title={t("projects.title")}
      initialSource={{ fileId: "projects", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {featured.map((p) => (
          <ProjectCard key={p.title} p={p} />
        ))}
      </div>
      <h2 className="mt-10 mb-4 font-mono text-xs tracking-wider uppercase" style={{ color: "var(--ide-fg-dim)" }}>
        {t("projects.archiveTitle")}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {archive.map((p) => (
          <ProjectCard key={p.title} p={p} />
        ))}
      </div>
      <p className="mt-8 text-center">
        <a href="https://github.com/Pochonski" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: "var(--ide-accent)" }}>
          {t("projects.viewMore")} →
        </a>
      </p>
    </EditorPage>
  );
}
