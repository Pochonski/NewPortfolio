import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { Markdown } from "@/components/ide/Markdown";
import { PreviewCard } from "@/components/preview";
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
  const src = aboutMd(t("about.title"), t("about.p1"), t("about.p2"), locale);

  return (
    <EditorPage
      title={t("about.title")}
      initialSource={{ fileId: "about", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <PreviewCard hover={false} className="p-6 sm:p-8">
        <Markdown code={src.code} />
      </PreviewCard>
    </EditorPage>
  );
}
