import { NextResponse } from "next/server";
import { highlightCode } from "@/lib/shiki";
import { buildFileSource } from "@/lib/build-source";
import { IDE_FILES } from "@/lib/files";
import { THEME_IDS, DEFAULT_THEME } from "@/lib/themes";

// On-demand file sources for editor groups showing files other than the
// current route. Responses are cacheable; highlights are identical across
// IDE themes (css-variables), only `settings` varies by theme (content).
const mem = new Map<string, { codeHtml: string } & Record<string, unknown>>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("file") ?? "";
  const rawLocale = searchParams.get("locale");
  const rawTheme = searchParams.get("theme") ?? "";
  const locale = rawLocale === "en" ? "en" : "es";
  const theme = (THEME_IDS as string[]).includes(rawTheme) ? rawTheme : DEFAULT_THEME;

  if (!IDE_FILES.some((f) => f.id === fileId)) {
    return NextResponse.json({ error: "unknown file" }, { status: 400 });
  }

  const key = `${locale}:${fileId}:${fileId === "settings" ? theme : ""}`;
  const hit = mem.get(key);
  if (hit) {
    return NextResponse.json(hit, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate" },
    });
  }

  const src = buildFileSource(fileId, locale, theme);
  if (!src) {
    return NextResponse.json({ error: "unknown file" }, { status: 400 });
  }
  const payload = { ...src, codeHtml: await highlightCode(src.code, src.shikiLang) };
  mem.set(key, payload);
  return NextResponse.json(payload, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate" },
  });
}
