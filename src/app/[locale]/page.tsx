import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, Mail, MapPin } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { homeTsx } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  return { title: "home.tsx", description: t("hero.role") };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const src = homeTsx({ role: t("hero.role"), location: t("hero.location") });

  return (
    <EditorPage
      route="/"
      title={t("hero.greeting") + " Joseph Fonseca"}
      initialSource={{ fileId: "home", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-5">
          <Image
            src="/images/profile.webp"
            alt="Joseph Fonseca"
            width={96}
            height={96}
            className="rounded-xl border object-cover"
            priority
          />
          <div className="flex flex-col gap-1 text-sm" style={{ color: "var(--ide-fg-dim)" }}>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> {t("hero.location")}
            </span>
            <span className="font-mono text-xs">github.com/Pochonski</span>
            <span className="font-mono text-xs">joseph19102005@gmail.com</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/cv/Joseph-Fonseca-CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold"
            style={{ background: "var(--ide-button)", color: "var(--ide-button-fg)" }}
          >
            <FileText size={16} /> {t("hero.viewResume")}
          </a>
          <Link
            href={locale === "en" ? "/en/contact" : "/contact"}
            className="flex items-center gap-2 rounded-md border px-5 py-3 text-sm font-semibold"
            style={{ borderColor: "var(--ide-accent)", color: "var(--ide-accent)" }}
          >
            <Mail size={16} /> {t("hero.getInTouch")}
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: locale === "en" ? "/en/projects" : "/projects", label: t("nav.projects"), desc: "4 featured + archive" },
            { href: locale === "en" ? "/en/experience" : "/experience", label: t("nav.experience"), desc: "2023 — present" },
            { href: locale === "en" ? "/en/github" : "/github", label: "GitHub", desc: "@Pochonski" },
          ].map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group rounded-lg border p-4 transition-transform hover:-translate-y-0.5"
              style={{ borderColor: "var(--ide-border)", background: "var(--ide-terminal)" }}
            >
              <p className="flex items-center justify-between text-sm font-semibold" style={{ color: "var(--ide-fg-bright)" }}>
                {c.label}
                <ArrowRight size={15} style={{ color: "var(--ide-accent)" }} />
              </p>
              <p className="mt-1 font-mono text-xs" style={{ color: "var(--ide-fg-dim)" }}>
                {c.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </EditorPage>
  );
}
