import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { studiesMd } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";
import { ExternalLink, GraduationCap } from "lucide-react";

interface StudyItem {
  degree: string;
  institution: string;
  link: string;
  period: string;
  location: string;
  points: string[];
}

export default async function StudiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const items = t.raw("studies.items") as StudyItem[];
  const src = studiesMd(items);

  return (
    <EditorPage
      route="/studies"
      title={t("studies.title")}
      initialSource={{ fileId: "studies", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <div className="flex flex-col gap-4">
        {items.map((s) => (
          <article key={s.degree} className="rounded-lg border p-5" style={{ borderColor: "var(--ide-border)", background: "var(--ide-terminal)" }}>
            <p className="flex items-center gap-2 font-mono text-xs" style={{ color: "var(--ide-accent)" }}>
              <GraduationCap size={14} /> {s.period} · {s.location}
            </p>
            <h2 className="mt-2 text-base font-semibold" style={{ color: "var(--ide-fg-bright)" }}>{s.degree}</h2>
            <a href={s.link} target="_blank" rel="noopener noreferrer" className="mt-0.5 flex items-center gap-1.5 text-sm hover:underline" style={{ color: "var(--ide-accent)" }}>
              {s.institution} <ExternalLink size={13} />
            </a>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed" style={{ color: "var(--ide-fg)" }}>
              {s.points.map((p) => (
                <li key={p.slice(0, 32)}>{p}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </EditorPage>
  );
}
