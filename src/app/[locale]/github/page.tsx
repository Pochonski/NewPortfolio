import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { Markdown } from "@/components/ide/Markdown";
import { githubMd } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";
import { getGithubData } from "@/lib/github";
import { PreviewCard } from "@/components/preview";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  return { title: "github.md", description: t("github.pageDesc") };
}

export default async function GithubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const data = await getGithubData();
  const src = githubMd(locale, data);

  return (
    <EditorPage
      title="GitHub — @Pochonski"
      initialSource={{ fileId: "github", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      {!data ? (
        <PreviewCard hover={false} className="p-6 text-sm">
          <span style={{ color: "var(--ide-fg)" }}>
            {t("github.apiDown")}{" "}
            <a href="https://github.com/Pochonski" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4" style={{ color: "var(--ide-accent)" }}>
              {t("github.openProfile")}
            </a>
            .
          </span>
        </PreviewCard>
      ) : (
        <PreviewCard hover={false} className="p-6 sm:p-8">
          <Markdown code={src.code} />
        </PreviewCard>
      )}
    </EditorPage>
  );
}
