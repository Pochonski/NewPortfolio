const FALLBACK_SITE_URL = "https://joseph-fonseca-dev.vercel.app";

function siteUrl(value: string | undefined): string {
  if (!value) return FALLBACK_SITE_URL;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return FALLBACK_SITE_URL;
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

/** Public canonical origin. Configure NEXT_PUBLIC_SITE_URL per deployment. */
export const SITE_URL = siteUrl(process.env.NEXT_PUBLIC_SITE_URL);
