import type { MetadataRoute } from "next";

const SITE = "https://joseph-fonseca-dev.vercel.app";
const ROUTES = ["", "/about", "/experience", "/studies", "/projects", "/skills", "/github", "/contact", "/settings"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.flatMap((r) => [
    { url: `${SITE}${r}`, lastModified: now, changeFrequency: "monthly" as const, priority: r === "" ? 1 : 0.7 },
    { url: `${SITE}/en${r}`, lastModified: now, changeFrequency: "monthly" as const, priority: r === "" ? 0.9 : 0.6 },
  ]);
}
