import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { skillsTs } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";
import { skills } from "@/content/skills";
import { PreviewCard, SectionHeader } from "@/components/preview";

const LEVEL_PCT: Record<string, number> = { familiar: 55, proficient: 78, expert: 94 };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  return { title: "skills.ts", description: t("skills.pageDesc") };
}

export default async function SkillsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const levelNames = t.raw("skills.levels") as Record<string, string>;
  const groups = [
    { key: "frontend", label: t("skills.frontend"), items: skills.frontend },
    { key: "backend", label: t("skills.backend"), items: skills.backend },
    { key: "tools", label: t("skills.tools"), items: skills.tools },
  ];
  const src = skillsTs(groups.map((g) => ({ key: g.key, items: g.items })), locale);

  return (
    <EditorPage
      title={t("skills.title")}
      initialSource={{ fileId: "skills", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <div className="flex flex-col gap-8">
        {groups.map((g) => (
          <section key={g.key} aria-label={g.label}>
            <SectionHeader label={g.label} count={g.items.length} />
            <PreviewCard hover={false} className="flex flex-col gap-1 p-3 sm:p-4">
              {g.items.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-4 rounded-lg px-2 py-2 transition-colors hover:bg-[rgba(var(--ide-accent-rgb),0.06)]"
                >
                  <span className="w-36 shrink-0 truncate text-sm sm:w-40" style={{ color: "var(--ide-fg)" }}>
                    {s.name}
                    <span className="ml-2 font-mono text-[10px]" style={{ color: "var(--ide-fg-dim)" }}>
                      {t("skills.years", { n: s.years })}
                    </span>
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--ide-border)" }} role="progressbar" aria-valuenow={LEVEL_PCT[s.level]} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name} ${levelNames[s.level] ?? s.level}`}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${LEVEL_PCT[s.level]}%`,
                        background: "linear-gradient(90deg, var(--ide-accent), var(--ide-success))",
                        boxShadow: "0 0 8px rgba(var(--ide-accent-rgb), 0.55)",
                      }}
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
                    {levelNames[s.level] ?? s.level}
                  </span>
                </div>
              ))}
            </PreviewCard>
          </section>
        ))}
      </div>
    </EditorPage>
  );
}
