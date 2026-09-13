import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { experienceJson } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";
import { ExternalLink } from "lucide-react";

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
  return {
    title: "experience.json",
    description:
      locale === "en"
        ? "Work experience of Joseph Fonseca: ScoreHub, StickerHub, Perfumes El Pocho, SECSA."
        : "Experiencia de Joseph Fonseca: ScoreHub, StickerHub, Perfumes El Pocho, SECSA.",
  };
}

export default async function ExperiencePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const items = t.raw("experience.items") as ExpItem[];
  const src = experienceJson(items);

  return (
    <EditorPage
      route="/experience"
      title={t("experience.title")}
      initialSource={{ fileId: "experience", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <ol className="flex flex-col gap-4">
        {items.map((job) => (
          <li key={job.company + job.title} className="rounded-lg border p-5" style={{ borderColor: "var(--ide-border)", background: "var(--ide-terminal)" }}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold" style={{ color: "var(--ide-fg-bright)" }}>{job.title}</h2>
              <span className="font-mono text-xs" style={{ color: "var(--ide-accent)" }}>{job.period}</span>
            </div>
            <a href={job.link} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1.5 text-sm hover:underline" style={{ color: "var(--ide-accent)" }}>
              {job.company} <ExternalLink size={13} />
            </a>
            <p className="mt-1 font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>{job.type} · {job.location}</p>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed" style={{ color: "var(--ide-fg)" }}>
              {job.points.map((p) => (
                <li key={p.slice(0, 32)}>{p}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </EditorPage>
  );
}
