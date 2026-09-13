import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { EditorPage, CodeCard } from "@/components/ide/EditorPage";
import { aboutMd } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  return { title: "about.md", description: t("about.p1") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const src = aboutMd(t("about.title"), t("about.p1"), t("about.p2"));

  return (
    <EditorPage
      route="/about"
      title={t("about.title")}
      initialSource={{ fileId: "about", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <div className="flex flex-col gap-6">
        <CodeCard>
          <p><span style={{ color: "var(--ide-accent)" }}>{"// "}</span>{t("about.p1")}</p>
          <p className="mt-3"><span style={{ color: "var(--ide-accent)" }}>{"// "}</span>{t("about.p2")}</p>
        </CodeCard>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4" style={{ borderColor: "var(--ide-border)" }}>
            <p className="font-mono text-xs" style={{ color: "var(--ide-fg-dim)" }}>const focus</p>
            <p className="mt-1 text-sm" style={{ color: "var(--ide-fg-bright)" }}>React · Next.js · Supabase · Vercel CI/CD</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: "var(--ide-border)" }}>
            <p className="font-mono text-xs" style={{ color: "var(--ide-fg-dim)" }}>const base</p>
            <p className="mt-1 text-sm" style={{ color: "var(--ide-fg-bright)" }}>Costa Rica · Remoto · TEC</p>
          </div>
        </div>
      </div>
    </EditorPage>
  );
}
