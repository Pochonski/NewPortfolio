import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { contactCss } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";
import { ContactForm } from "@/components/ContactForm";
import { contactInfo, socialLinks } from "@/content/site";
import { ExternalLink, Linkedin, Github, Mail } from "lucide-react";
import { PreviewCard } from "@/components/preview";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  return { title: "contact.css", description: t("contact.connectDesc") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const src = contactCss(locale);

  return (
    <EditorPage
      title={t("contact.title")}
      initialSource={{ fileId: "contact", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <div className="flex flex-col gap-5">
        <div className="rise flex flex-wrap items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl border"
            style={{
              background: "rgba(var(--ide-accent-rgb), 0.1)",
              borderColor: "rgba(var(--ide-accent-rgb), 0.4)",
              color: "var(--ide-accent)",
              boxShadow: "0 8px 24px rgba(var(--ide-accent-rgb), 0.2)",
            }}
          >
            <Mail size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold" style={{ color: "var(--ide-fg-bright)" }}>
              {t("contact.connect")}
            </h2>
            <p className="truncate font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
              {t("contact.connectDesc")}
            </p>
          </div>
          <span className="font-mono text-xs" style={{ color: "var(--ide-accent)" }}>
            {contactInfo.email}
          </span>
        </div>

        <div className="rise rise-1 flex flex-wrap gap-2" aria-label={t("contact.socialsAria")}>
          {socialLinks.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("contact.profileAria", { site: s.name })}
              className="glass-subtle hover-glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ color: "var(--ide-fg)" }}
            >
              {s.name === "GitHub" ? <Github size={14} style={{ color: "var(--ide-accent)" }} /> : <Linkedin size={14} style={{ color: "var(--ide-accent)" }} />}
              {s.name}
              <ExternalLink size={12} style={{ color: "var(--ide-fg-dim)" }} />
            </a>
          ))}
        </div>

        <PreviewCard hover={false} className="p-5 sm:p-6">
          <ContactForm />
        </PreviewCard>
      </div>
    </EditorPage>
  );
}
