import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { EditorPage } from "@/components/ide/EditorPage";
import { projectsJs } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";
import { caseStudies } from "@/content/case-studies";
import { ArrowRight, ExternalLink, FileText, Github } from "lucide-react";
import { PreviewCard, SectionHeader, TagPill } from "@/components/preview";

interface Project {
  slug?: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  github: string;
}

const HAIRLINE: React.CSSProperties = {
  height: 1,
  background:
    "linear-gradient(to right, rgba(var(--ide-accent-rgb), 0.45), rgba(var(--ide-accent-rgb), 0))",
};

function ProjectCard({ p, liveLabel, codeLabel, caseLabel }: { p: Project; liveLabel: string; codeLabel: string; caseLabel: string }) {
  const hasStudy = !!p.slug && p.slug in caseStudies;
  const initial = p.title.replace(/[^A-Za-z0-9]/g, "").charAt(0).toUpperCase() || "•";
  const host = (() => {
    try {
      return new URL(p.link).host;
    } catch {
      return p.link;
    }
  })();
  return (
    <PreviewCard className="group flex flex-col p-5">
      {/* Top row: monogram + title + live chip */}
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold"
          style={{
            background: "rgba(var(--ide-accent-rgb), 0.12)",
            color: "var(--ide-accent)",
            border: "1px solid rgba(var(--ide-accent-rgb), 0.35)",
          }}
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold" style={{ color: "var(--ide-fg-bright)" }}>
            {p.title}
          </h2>
          <p className="truncate font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
            {host}
          </p>
        </div>
        <span
          className="glass-subtle flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase"
          title={liveLabel}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute h-full w-full animate-ping rounded-full"
              style={{ background: "var(--ide-success)" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--ide-success)" }}
            />
          </span>
          {liveLabel}
        </span>
      </div>

      <div className="my-3" style={HAIRLINE} />

      {/* Description */}
      <p className="flex-1 text-sm leading-relaxed" style={{ color: "var(--ide-fg)" }}>
        {p.description}
      </p>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.tags.map((tag) => (
          <TagPill key={tag}>{tag}</TagPill>
        ))}
      </div>

      <div className="my-4" style={HAIRLINE} />

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] font-medium">
          <a
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 underline-offset-4 hover:underline"
            style={{ color: "var(--ide-accent)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--ide-success)" }}
              aria-hidden
            />
            {liveLabel}
            <ExternalLink size={12} />
          </a>
          <a
            href={p.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 underline-offset-4 hover:underline"
            style={{ color: "var(--ide-fg-dim)" }}
          >
            <Github size={13} />
            {codeLabel}
          </a>
          {hasStudy && (
            <Link
              href={`/projects/${p.slug}` as "/projects/[slug]"}
              className="flex items-center gap-1.5 underline-offset-4 hover:underline"
              style={{ color: "var(--ide-accent)" }}
            >
              <FileText size={12} />
              {caseLabel}
            </Link>
          )}
        </div>
        <ArrowRight
          size={15}
          aria-hidden
          className="shrink-0 transition-transform group-hover:translate-x-0.5"
          style={{ color: "var(--ide-accent)" }}
        />
      </div>
    </PreviewCard>
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
  const src = projectsJs(featured, locale);

  return (
    <EditorPage
      title={t("projects.title")}
      initialSource={{ fileId: "projects", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <div className="rise mb-6">
        <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold tracking-tight" style={{ color: "var(--ide-fg-bright)" }}>
          {t("projects.title")}
          <span
            className="glass-subtle rounded-full px-2 py-0.5 font-mono text-[10px] font-normal"
            style={{ color: "var(--ide-accent)" }}
          >
            {featured.length}
          </span>
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--ide-fg-dim)" }}>
          {t("projects.subtitle")}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {featured.map((p) => (
          <ProjectCard key={p.title} p={p} liveLabel={t("projects.viewLive")} codeLabel={t("caseStudy.code")} caseLabel={t("projects.caseStudy")} />
        ))}
      </div>
      <div className="mt-10">
        <SectionHeader label={t("projects.archiveTitle")} count={archive.length} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {archive.map((p) => (
          <ProjectCard key={p.title} p={p} liveLabel={t("projects.viewLive")} codeLabel={t("caseStudy.code")} caseLabel={t("projects.caseStudy")} />
        ))}
      </div>
      <p className="mt-8 text-center">
        <a href="https://github.com/Pochonski" target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline-offset-4 hover:underline" style={{ color: "var(--ide-accent)" }}>
          {t("projects.viewMore")} →
        </a>
      </p>
    </EditorPage>
  );
}
