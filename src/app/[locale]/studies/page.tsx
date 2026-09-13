import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { Markdown } from "@/components/ide/Markdown";
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
  return {
    title: "studies.md",
    description:
      locale === "en"
        ? "Studies of Joseph Fonseca: Computer Engineering (TEC) and Azure Cloud Support."
        : "Estudios de Joseph Fonseca: Ingeniería en Computadores (TEC) y Azure Cloud Support.",
  };
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
      <Markdown code={src.code} />
    </EditorPage>
  );
}
