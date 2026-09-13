import { NextResponse } from "next/server";
import { buildFileSource } from "@/lib/build-source";
import { IDE_FILES } from "@/lib/files";

export interface SearchHit {
  fileId: string;
  filename: string;
  line: number;
  text: string;
}

const MAX_HITS = 60;

// Global workspace search across every file's display source.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const rawLocale = searchParams.get("locale");
  const locale = rawLocale === "en" ? "en" : "es";

  if (q.length < 2) {
    return NextResponse.json({ results: [] as SearchHit[] });
  }

  const results: SearchHit[] = [];
  for (const f of IDE_FILES) {
    const src = buildFileSource(f.id, locale);
    if (!src) continue;
    const lines = src.code.split("\n");
    for (let i = 0; i < lines.length && results.length < MAX_HITS; i++) {
      if (lines[i].toLowerCase().includes(q)) {
        results.push({
          fileId: f.id,
          filename: src.filename,
          line: i + 1,
          text: lines[i].trim().slice(0, 160),
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
