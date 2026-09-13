import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export default async function LocaleNotFound({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("notfound");

  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
        portfolio › 404
      </p>
      <p className="mt-4 text-7xl font-bold" style={{ color: "var(--ide-accent)" }}>
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold" style={{ color: "var(--ide-fg-bright)" }}>
        {t("heading")}
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--ide-fg-dim)" }}>
        {t("body")}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md px-5 py-2.5 text-sm font-semibold"
          style={{ background: "var(--ide-button)", color: "var(--ide-button-fg)" }}
        >
          {t("home")}
        </Link>
        <Link
          href="/projects"
          className="rounded-md border px-5 py-2.5 text-sm font-semibold"
          style={{ borderColor: "var(--ide-accent)", color: "var(--ide-accent)" }}
        >
          {t("projects")}
        </Link>
      </div>
      <p className="mt-6 font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
        {t("hint")}
      </p>
    </div>
  );
}
