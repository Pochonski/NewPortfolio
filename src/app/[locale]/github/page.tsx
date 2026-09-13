import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { Markdown } from "@/components/ide/Markdown";
import { githubMd } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";
import { getGithubData } from "@/lib/github";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "github.md",
    description:
      locale === "en"
        ? "Profile and repositories of @Pochonski on GitHub."
        : "Perfil y repositorios de @Pochonski en GitHub.",
  };
}

export default async function GithubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const data = await getGithubData();
  const src = githubMd(locale, data);

  return (
    <EditorPage
      route="/github"
      title="GitHub — @Pochonski"
      initialSource={{ fileId: "github", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      {!data ? (
        <div className="rounded-lg border p-6 text-sm" style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg)" }}>
          {t("github.apiDown")}{" "}
          <a href="https://github.com/Pochonski" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--ide-accent)" }}>
            {t("github.openProfile")}
          </a>
          .
        </div>
      ) : (
        <Markdown code={src.code} />
      )}
    </EditorPage>
  );
}
