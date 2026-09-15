import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { routing, type Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { projectJsSingle } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";
import { caseStudies } from "@/content/case-studies";
import { ctaClass, ctaStyle } from "@/components/chrome";
import { SectionHeader, TagPill } from "@/components/preview";

interface FeaturedProject {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  github: string;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.keys(caseStudies).map((slug) => ({ locale, slug }))
  );
}

async function getProject(locale: string, slug: string) {
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const featured = t.raw("projects.featured") as FeaturedProject[];
  const project = featured.find((p) => p.slug === slug);
  const study = caseStudies[slug];
  if (!project || !study) return null;
  return { t, project, study };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const found = await getProject(locale, slug);
  if (!found) return { title: slug };
  return { title: `${found.project.title} — case study`, description: found.project.description };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const found = await getProject(locale, slug);
  if (!found) notFound();
  const { t, project, study } = found;
  const es = locale !== "en";
  const lang = es ? "es" : "en";

  const src = projectJsSingle(project, locale);

  return (
    <EditorPage
      title={`${project.title} — ${t("projects.caseStudy")}`}
      initialSource={{ fileId: "projects", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <Link
        href="/projects"
        className="glass-subtle hover-glass mb-6 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium"
        style={{ color: "var(--ide-fg-dim)" }}
      >
        <ArrowLeft size={14} /> {t("caseStudy.back")}
      </Link>

      <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--ide-fg-bright)" }}>
        {project.title}
      </h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--ide-fg-dim)" }}>
        {project.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <TagPill key={tag}>{tag}</TagPill>
        ))}
      </div>

      {(
        [
          [t("caseStudy.challenge"), study.challenge[lang]],
          [t("caseStudy.solution"), study.solution[lang]],
        ] as const
      ).map(([heading, body]) => (
        <section key={heading} className="mt-8">
          <SectionHeader label={heading} />
          <p className="max-w-3xl text-[15px] leading-relaxed" style={{ color: "var(--ide-fg)" }}>
            {body}
          </p>
        </section>
      ))}

      <section className="mt-8">
        <SectionHeader label={t("caseStudy.results")} />
        <ul className="flex max-w-3xl list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed marker:text-[var(--ide-accent)]" style={{ color: "var(--ide-fg)" }}>
          {study.results[lang].map((r) => (
            <li key={r.slice(0, 32)}>{r}</li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 ${ctaClass()}`}
          style={ctaStyle("primary")}
        >
          <ExternalLink size={13} /> {t("caseStudy.live")}
        </a>
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 ${ctaClass()}`}
          style={ctaStyle("ghost")}
        >
          <Github size={14} /> {t("caseStudy.code")}
        </a>
      </div>
    </EditorPage>
  );
}
