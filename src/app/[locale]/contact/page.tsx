import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { contactCss } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";
import { ContactForm } from "@/components/ContactForm";

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const src = contactCss();

  return (
    <EditorPage
      route="/contact"
      title={t("contact.title")}
      initialSource={{ fileId: "contact", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <div className="rounded-lg border p-5" style={{ borderColor: "var(--ide-border)", background: "var(--ide-terminal)" }}>
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--ide-fg-bright)" }}>{t("contact.connect")}</h2>
        <ContactForm />
      </div>
    </EditorPage>
  );
}
