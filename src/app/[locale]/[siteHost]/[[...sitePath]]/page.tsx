import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { siteFromVirtualPath, virtualPathForSiteUrl } from "@/lib/files";
import { SplitView } from "@/components/ide/SplitView";

type Params = Promise<{ locale: string; siteHost: string; sitePath?: string[] }>;

async function resolveSite(params: Params) {
  const { locale, siteHost, sitePath } = await params;
  if (locale !== "es" && locale !== "en") notFound();
  const virtualPath = `/${siteHost}${sitePath?.length ? `/${sitePath.join("/")}` : ""}`;
  const resolved = siteFromVirtualPath(virtualPath);
  if (!resolved) notFound();
  return { locale: locale as Locale, ...resolved };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, site, href } = await resolveSite(params);
  return {
    title: site.label,
    alternates: { canonical: virtualPathForSiteUrl(href, locale) ?? "/projects" },
  };
}

export default async function VirtualSitePage({ params }: { params: Params }) {
  const { locale, site } = await resolveSite(params);
  setRequestLocale(locale);
  return (
    <div className="flex h-full w-full flex-col">
      <h1 className="sr-only">{site.label}</h1>
      <SplitView preview={null} />
    </div>
  );
}
