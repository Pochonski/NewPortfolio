import { NextResponse } from "next/server";
import { buildFileSource } from "@/lib/build-source";
import { getGithubData } from "@/lib/github";
import { IDE_FILES } from "@/lib/files";
import { getClientIp, rateLimit } from "@/lib/security";

export interface SearchHit {
  fileId: string;
  filename: string;
  line: number;
  text: string;
}

const MAX_HITS = 60;

// Global workspace search across every file's display source.
export async function GET(req: Request) {
  if (!rateLimit(`search:${getClientIp(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "60" } });
  }
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 100);
  const rawLocale = searchParams.get("locale");
  const locale = rawLocale === "en" ? "en" : "es";

  if (q.length < 2) {
    return NextResponse.json({ results: [] as SearchHit[] });
  }

  // Fetch once so the github.md index matches the live preview.
  const githubData = await getGithubData().catch(() => null);
  const results: SearchHit[] = [];
  for (const f of IDE_FILES) {
    const src = buildFileSource(f.id, locale, undefined, githubData);
    if (!src) continue;
    const lines = src.code.split("\n");
    for (let i = 0; i < lines.length && results.length < MAX_HITS; i++) {
      const line = lines[i] ?? "";
      if (line.toLowerCase().includes(q)) {
        results.push({
          fileId: f.id,
          filename: src.filename,
          line: i + 1,
          text: line.trim().slice(0, 160),
        });
      }
    }
    if (results.length >= MAX_HITS) break;
  }

  return NextResponse.json(
    { results },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate" } }
  );
}
