import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { experienceJson } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";
import { ExternalLink } from "lucide-react";
import { PreviewCard, TagPill } from "@/components/preview";

interface ExpItem {
  title: string;
  company: string;
  link: string;
  period: string;
  location: string;
  type: string;
  points: string[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  return { title: "experience.json", description: t("experience.pageDesc") };
}

export default async function ExperiencePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const items = t.raw("experience.items") as ExpItem[];
  const src = experienceJson(items);

  return (
    <EditorPage
      title={t("experience.title")}
      initialSource={{ fileId: "experience", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <ol className="relative ml-1.5 flex flex-col gap-5 border-l pl-6" style={{ borderColor: "var(--ide-border)" }}>
        {items.map((job) => (
          <li key={job.company + job.title} className="relative">
            <span
              aria-hidden
              className="absolute top-2 h-2.5 w-2.5 rounded-full"
              style={{
                left: "-31px",
                background: "var(--ide-accent)",
                boxShadow: "0 0 0 4px rgba(var(--ide-accent-rgb), 0.15)",
              }}
            />
            <PreviewCard className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold" style={{ color: "var(--ide-fg-bright)" }}>{job.title}</h2>
                <TagPill>{job.period}</TagPill>
              </div>
              <a href={job.link} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline" style={{ color: "var(--ide-accent)" }}>
                {job.company} <ExternalLink size={13} />
              </a>
              <p className="mt-1 font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>{job.type} · {job.location}</p>
              <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed marker:text-[var(--ide-accent)]" style={{ color: "var(--ide-fg)" }}>
                {job.points.map((p) => (
                  <li key={p.slice(0, 32)}>{p}</li>
                ))}
              </ul>
            </PreviewCard>
          </li>
        ))}
      </ol>
    </EditorPage>
  );
}
