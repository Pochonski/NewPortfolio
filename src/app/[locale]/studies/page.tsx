import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { Markdown } from "@/components/ide/Markdown";
import { PreviewCard } from "@/components/preview";
import { studiesMd } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";

interface StudyItem {
  degree: string;
  institution: string;
  link: string;
  period: string;
  location: string;
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
  return { title: "studies.md", description: t("studies.pageDesc") };
}

export default async function StudiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const items = t.raw("studies.items") as StudyItem[];
  const src = studiesMd(items);

  return (
    <EditorPage
      title={t("studies.title")}
      initialSource={{ fileId: "studies", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <PreviewCard hover={false} className="p-6 sm:p-8">
        <Markdown code={src.code} />
      </PreviewCard>
    </EditorPage>
  );
}
