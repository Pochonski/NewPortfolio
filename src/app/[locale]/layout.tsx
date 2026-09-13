import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/react";
import { routing, type Locale } from "@/i18n/routing";
import { IdeShell } from "@/components/ide/IdeShell";
import { LocaleLang } from "@/components/LocaleLang";

const SITE = "https://joseph-fonseca.vercel.app";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const es = locale !== "en";
  return {
    metadataBase: new URL(SITE),
    title: {
      default: "Joseph Fonseca — Software Engineer",
      template: "%s · Joseph Fonseca",
    },
    description: es
      ? "Portfolio estilo VS Code de Joseph Fonseca — React, Next.js, Supabase. Proyectos reales, experiencia y contacto."
      : "Joseph Fonseca's VS Code-style portfolio — React, Next.js, Supabase. Real projects, experience and contact.",
    alternates: {
      canonical: locale === "en" ? "/en" : "/",
      languages: { es: "/", en: "/en" },
    },
    openGraph: {
      type: "website",
      locale: es ? "es_CR" : "en_US",
      siteName: "Joseph Fonseca — Portfolio",
      title: "Joseph Fonseca — Software Engineer",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale as Locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleLang locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Joseph Fonseca",
            jobTitle: "Software Engineer",
            url: SITE,
            sameAs: [
              "https://github.com/Pochonski",
              "https://www.linkedin.com/in/joseph-fonseca-n",
            ],
            knowsAbout: ["React", "Next.js", "TypeScript", "Supabase", "Python", "Azure"],
          }),
        }}
      />
      <IdeShell>{children}</IdeShell>
      <Analytics />
    </NextIntlClientProvider>
  );
}
