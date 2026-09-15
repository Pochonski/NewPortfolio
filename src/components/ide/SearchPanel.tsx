"use client";

import { useEffect, useRef, useState } from "react";
import { SearchX } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { SearchHit } from "@/app/api/search/route";
import { FileIcon } from "./FileIcon";
import { IDE_FILES } from "@/lib/files";

function openFile(fileId: string) {
  window.dispatchEvent(new CustomEvent("porto-open-file", { detail: { fileId } }));
  window.dispatchEvent(new CustomEvent("porto-sidebar", { detail: { view: "files" } }));
}

// Sidebar search view (Ctrl+Shift+F): searches every file's display source.
export function SearchPanel() {
  const locale = useLocale();
  const t = useTranslations("ide.search");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) return;
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q.trim())}&locale=${locale}`
        );
        const data = (await res.json()) as { results: SearchHit[] };
        if (reqId.current === id) setHits(data.results ?? []);
      } catch {
        if (reqId.current === id) setHits([]);
      } finally {
        if (reqId.current === id) setBusy(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q, locale]);

  const isActive = q.trim().length >= 2;
  const grouped = new Map<string, SearchHit[]>();
  if (isActive) {
    for (const h of hits) {
      const arr = grouped.get(h.fileId) ?? [];
      arr.push(h);
      grouped.set(h.fileId, arr);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-3 pt-1 pb-2">
        <div
          className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
          style={{ borderColor: "var(--ide-border)", background: "var(--ide-bg)" }}
        >
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("placeholder")}
            aria-label={t("label")}
            spellCheck={false}
            autoComplete="off"
            className="w-full bg-transparent text-[13px] outline-none placeholder:opacity-50"
            style={{ color: "var(--ide-fg-bright)" }}
          />
        </div>
      </div>
      <div className="ide-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-3" role="list" aria-label={t("results")}>
        {isActive && busy && (
          <p className="px-2 py-4 text-center font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
            …
          </p>
        )}
        {isActive && !busy && hits.length === 0 && (
          <p className="flex items-center justify-center gap-2 px-2 py-4 text-center font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
            <SearchX size={13} />
            {t("noResults")}
          </p>
        )}
        {!isActive && (
          <p className="px-2 py-2 font-mono text-[11px] leading-5" style={{ color: "var(--ide-fg-dim)" }}>
            {t("hint")}
          </p>
        )}
        {[...grouped.entries()].map(([fileId, arr]) => {
          const file = IDE_FILES.find((f) => f.id === fileId);
          if (!file) return null;
          return (
            <div key={fileId} className="mb-2">
              <button
                onClick={() => openFile(fileId)}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[12px] font-semibold"
                style={{ color: "var(--ide-fg-bright)" }}
                title={file.filename}
              >
                <FileIcon file={file} size={14} />
                <span className="truncate font-mono">{file.filename}</span>
                <span className="font-mono text-[10px]" style={{ color: "var(--ide-fg-dim)" }}>
                  {arr.length}
                </span>
              </button>
              {arr.slice(0, 8).map((h, i) => (
                <button
                  key={i}
                  role="listitem"
                  onClick={() => openFile(fileId)}
                  className="block w-full truncate rounded px-2 py-1 pl-8 text-left font-mono text-[11.5px]"
                  style={{ color: "var(--ide-fg)" }}
                  title={`${file.filename}:${h.line}`}
                >
                  <span style={{ color: "var(--ide-accent)" }}>{h.line}</span>{" "}
                  <span className="opacity-80">{h.text || "…"}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
