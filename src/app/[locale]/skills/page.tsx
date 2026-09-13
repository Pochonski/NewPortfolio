import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { skillsTs } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";
import { skills } from "@/content/skills";

const LEVEL_PCT: Record<string, number> = { familiar: 55, proficient: 78, expert: 94 };

export default async function SkillsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const groups = [
    { key: "frontend", label: t("skills.frontend"), items: skills.frontend },
    { key: "backend", label: t("skills.backend"), items: skills.backend },
    { key: "tools", label: t("skills.tools"), items: skills.tools },
  ];
  const src = skillsTs(groups.map((g) => ({ key: g.key, items: g.items })));

  return (
    <EditorPage
      route="/skills"
      title={t("skills.title")}
      initialSource={{ fileId: "skills", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <div className="flex flex-col gap-8">
        {groups.map((g) => (
          <section key={g.key} aria-label={g.label}>
            <h2 className="mb-4 font-mono text-xs tracking-wider uppercase" style={{ color: "var(--ide-accent)" }}>
              {g.label}
            </h2>
            <div className="flex flex-col gap-3">
              {g.items.map((s) => (
                <div key={s.name} className="flex items-center gap-4">
                  <span className="w-40 shrink-0 truncate text-sm" style={{ color: "var(--ide-fg)" }}>{s.name}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--ide-border)" }} role="progressbar" aria-valuenow={LEVEL_PCT[s.level]} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name} ${s.level}`}>
                    <div className="h-full rounded-full" style={{ width: `${LEVEL_PCT[s.level]}%`, background: "var(--ide-accent)" }} />
                  </div>
                  <span className="w-16 shrink-0 text-right font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
                    {LEVEL_PCT[s.level]}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </EditorPage>
  );
}
