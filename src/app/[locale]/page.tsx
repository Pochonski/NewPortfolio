import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowRight, FileText, Mail, MapPin } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { ctaClass, ctaStyle } from "@/components/chrome";
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
      title={t("hero.greeting") + " Joseph Fonseca"}
      initialSource={{ fileId: "home", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      <div className="flex flex-col gap-8">
        <span
          className="rise inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
          style={{
            borderColor: "rgba(var(--ide-accent-rgb), 0.4)",
            background: "rgba(var(--ide-accent-rgb), 0.1)",
            color: "var(--ide-accent)",
          }}
        >
          <i className="relative flex h-2 w-2">
            <i className="absolute h-full w-full animate-ping rounded-full" style={{ background: "var(--ide-success)" }} />
            <i className="h-2 w-2 rounded-full" style={{ background: "var(--ide-success)" }} />
          </i>
          {t("hero.openToWork")}
        </span>

        <div className="rise rise-1 flex flex-wrap items-center gap-5">
          <span className="relative shrink-0">
            <Image
              src="/images/profile.webp"
              alt="Joseph Fonseca"
              width={96}
              height={96}
              className="rounded-2xl object-cover"
              style={{
                border: "2px solid rgba(var(--ide-accent-rgb), 0.55)",
                boxShadow: "0 8px 32px rgba(var(--ide-accent-rgb), 0.28)",
              }}
              priority
            />
            <i
              className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2"
              style={{ background: "var(--ide-success)", borderColor: "var(--ide-editor)" }}
              aria-hidden
            />
          </span>
          <div className="flex min-w-52 flex-1 flex-col gap-1.5">
            <p className="text-xs font-medium tracking-widest uppercase" style={{ color: "var(--ide-fg-dim)" }}>
              {t("hero.greeting")}
            </p>
            <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--ide-fg-bright)" }}>
              Joseph Fonseca
            </p>
            <p className="text-sm" style={{ color: "var(--ide-fg)" }}>
              {t("hero.role")}
            </p>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm" style={{ color: "var(--ide-fg-dim)" }}>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> {t("hero.location")}
              </span>
              <span className="font-mono text-xs">github.com/Pochonski</span>
              <span className="font-mono text-xs">joseph19102005@gmail.com</span>
            </span>
          </div>
        </div>

        <div className="rise rise-2 flex flex-wrap gap-2" aria-label="Stack">
          {["React", "Next.js", "TypeScript", "Supabase"].map((s) => (
            <span
              key={s}
              className="rounded-full border px-2.5 py-1 font-mono text-[11px]"
              style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)", background: "var(--ide-terminal)" }}
            >
              {s}
            </span>
          ))}
        </div>

        <div className="rise rise-3 flex flex-wrap gap-3">
          <a
            href="/cv/Joseph-Fonseca-CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 ${ctaClass()}`}
            style={ctaStyle("primary")}
          >
            <FileText size={16} /> {t("hero.viewResume")}
          </a>
          <Link
            href="/contact"
            className={`flex items-center gap-2 ${ctaClass()}`}
            style={ctaStyle("ghost")}
          >
            <Mail size={16} /> {t("hero.getInTouch")}
          </Link>
        </div>

        <div className="rise rise-4 grid gap-3 sm:grid-cols-3">
          {[
            { href: "/projects", label: t("nav.projects"), desc: t("home.featured") },
            { href: "/experience", label: t("nav.experience"), desc: t("home.experience") },
            { href: "/github", label: "GitHub", desc: "@Pochonski" },
          ].map((c) => (
            <Link
              key={c.label}
              href={c.href as "/"}
              className="card-premium group rounded-xl border p-4 transition-all hover:-translate-y-1"
              style={{ borderColor: "var(--ide-border)", background: "var(--ide-terminal)" }}
            >
              <p className="flex items-center justify-between text-sm font-semibold" style={{ color: "var(--ide-fg-bright)" }}>
                {c.label}
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                  style={{ color: "var(--ide-accent)" }}
                />
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
