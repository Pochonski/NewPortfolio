import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/case-studies";

const SITE = "https://joseph-fonseca-dev.vercel.app";
// Stable lastModified so sitemap.xml stays cacheable (bump on content changes).
const LAST_MODIFIED = new Date("2026-09-14");
const ROUTES: { path: string; priority: number; enPriority: number; changeFrequency: "monthly" | "yearly" }[] = [
  { path: "", priority: 1, enPriority: 0.9, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, enPriority: 0.6, changeFrequency: "monthly" },
  { path: "/experience", priority: 0.7, enPriority: 0.6, changeFrequency: "monthly" },
  { path: "/studies", priority: 0.7, enPriority: 0.6, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.8, enPriority: 0.7, changeFrequency: "monthly" },
  { path: "/skills", priority: 0.7, enPriority: 0.6, changeFrequency: "monthly" },
  { path: "/github", priority: 0.4, enPriority: 0.4, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, enPriority: 0.6, changeFrequency: "monthly" },
  { path: "/settings", priority: 0.3, enPriority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ROUTES.flatMap((r) => [
    { url: `${SITE}${r.path}`, lastModified: LAST_MODIFIED, changeFrequency: r.changeFrequency, priority: r.priority },
    { url: `${SITE}/en${r.path}`, lastModified: LAST_MODIFIED, changeFrequency: r.changeFrequency, priority: r.enPriority },
  ]);
  const studies = Object.keys(caseStudies).flatMap((slug) => [
    { url: `${SITE}/projects/${slug}`, lastModified: LAST_MODIFIED, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${SITE}/en/projects/${slug}`, lastModified: LAST_MODIFIED, changeFrequency: "monthly" as const, priority: 0.7 },
  ]);
  return [...pages, ...studies];
}
