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

  const src = projectJsSingle(project);

  return (
    <EditorPage
      route="/projects"
      title={`${project.title} — ${t("projects.caseStudy")}`}
      initialSource={{ fileId: "projects", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <Link
        href="/projects"
        className="mb-6 flex items-center gap-1.5 text-[13px] font-medium hover:underline"
        style={{ color: "var(--ide-fg-dim)" }}
      >
        <ArrowLeft size={14} /> {t("caseStudy.back")}
      </Link>

      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded border px-2 py-0.5 font-mono text-[11px]"
            style={{ borderColor: "var(--ide-border)", color: "var(--ide-accent)" }}
          >
            {tag}
          </span>
        ))}
      </div>

      {(
        [
          [t("caseStudy.challenge"), study.challenge[lang]],
          [t("caseStudy.solution"), study.solution[lang]],
        ] as const
      ).map(([heading, body]) => (
        <section key={heading} className="mt-8">
          <h2 className="font-mono text-xs tracking-wider uppercase" style={{ color: "var(--ide-accent)" }}>
            {heading}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "var(--ide-fg)" }}>
            {body}
          </p>
        </section>
      ))}

      <section className="mt-8">
        <h2 className="font-mono text-xs tracking-wider uppercase" style={{ color: "var(--ide-accent)" }}>
          {t("caseStudy.results")}
        </h2>
        <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed" style={{ color: "var(--ide-fg)" }}>
          {study.results[lang].map((r) => (
            <li key={r.slice(0, 32)}>{r}</li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-4 text-[13px] font-medium">
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:underline"
          style={{ color: "var(--ide-accent)" }}
        >
          <ExternalLink size={13} /> {t("caseStudy.live")}
        </a>
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:underline"
          style={{ color: "var(--ide-fg-dim)" }}
        >
          <Github size={14} /> {t("caseStudy.code")}
        </a>
      </div>
    </EditorPage>
  );
}
