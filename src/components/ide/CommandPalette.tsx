"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IDE_FILES } from "@/lib/files";
import { IDE_THEMES } from "@/lib/themes";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { FileIcon } from "./FileIcon";

interface Item {
  key: string;
  group: string;
  label: string;
  hint?: string;
  run: () => void;
  file?: (typeof IDE_FILES)[number];
}

export function CommandPalette({
  open,
  onClose,
  onTerminal,
}: {
  open: boolean;
  onClose: () => void;
  onTerminal: () => void;
}) {
  const router = useRouter();
  const locale = useLocale();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const [themeMode, setThemeMode] = useState(false);
  const [sidePicker, setSidePicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: Item[] = useMemo(() => {
    const nav: Item[] = IDE_FILES.map((f) => ({
      key: `go-${f.id}`,
      group: "Go to File",
      label: `Go to ${f.filename}`,
      hint: f.route === "/" ? "G H" : `G ${f.id[0].toUpperCase()}`,
      file: f,
      run: () => router.push(f.route as "/"),
    }));
    const acts: Item[] = [
      { key: "term", group: "Terminal", label: "Toggle Terminal", hint: "Ctrl+`", run: onTerminal },
      {
        key: "split",
        group: "View",
        label: "Toggle Split Editor (Code / Preview)",
        hint: "Ctrl+\\",
        run: () => window.dispatchEvent(new CustomEvent("porto-split")),
      },
      { key: "theme", group: "Preferences", label: "Change Color Theme", hint: "K T", run: () => { setThemeMode(true); setIdx(0); setQ(""); } },
      {
        key: "shortcuts",
        group: "Help",
        label: "Show Keyboard Shortcuts",
        run: () => window.dispatchEvent(new CustomEvent("porto-shortcuts")),
      },
      {
        key: "side",
        group: "View",
        label: "Open File to the Side…",
        run: () => { setSidePicker(true); setIdx(0); setQ(""); },
      },
      {
        key: "lang",
        group: "Preferences",
        label: locale === "es" ? "Switch to English" : "Cambiar a Español",
        run: () => {
          const clean = window.location.pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/";
          const target = locale === "es" ? "en" : "es";
          window.location.href = target === "es" ? clean : `/${target}${clean === "/" ? "" : clean}`;
        },
      },
    ];
    const themes: Item[] = IDE_THEMES.map((t) => ({
      key: `th-${t.id}`,
      group: "Color Theme",
      label: `${t.name} — ${t.publisher}`,
      run: () => {
        document.documentElement.setAttribute("data-theme", t.id);
        try {
          localStorage.setItem("porto-ide-theme", t.id);
        } catch {}
        window.dispatchEvent(new CustomEvent("porto-theme", { detail: t.id }));
        onClose();
      },
    }));
    const sideFiles: Item[] = IDE_FILES.map((f) => ({
      key: `side-${f.id}`,
      group: "Open to the Side",
      label: f.filename,
      file: f,
      run: () => {
        window.dispatchEvent(
          new CustomEvent("porto-open-file", { detail: { fileId: f.id, toSide: true } })
        );
        onClose();
      },
    }));
    return themeMode ? themes : sidePicker ? sideFiles : [...nav, ...acts];
  }, [router, locale, onTerminal, onClose, themeMode, sidePicker]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => `${i.group} ${i.label}`.toLowerCase().includes(s));
  }, [items, q]);

  // Fresh state on every mount (parent mounts conditionally), autofocus only.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (themeMode) {
          setThemeMode(false);
          setQ("");
          setIdx(0);
        } else if (sidePicker) {
          setSidePicker(false);
          setQ("");
          setIdx(0);
        } else onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setIdx((i) => (filtered.length ? (i + 1) % filtered.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIdx((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const it = filtered[idx];
        if (it) {
          it.run();
          if (it.key !== "theme" && it.key !== "side") onClose();
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, filtered, idx, onClose, themeMode, sidePicker]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" role="dialog" aria-modal="true" aria-label="Command Palette">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-lg border shadow-2xl"
        style={{ background: "var(--ide-explorer)", borderColor: "var(--ide-border)" }}
      >
        <div className="flex items-center gap-2 border-b px-3" style={{ borderColor: "var(--ide-border)" }}>
          <span style={{ color: "var(--ide-fg-dim)" }}>›</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            placeholder={themeMode ? "Select color theme" : sidePicker ? "Open file to the side…" : "Type a command or search files..."}
            className="w-full bg-transparent py-3 text-sm outline-none"
            style={{ color: "var(--ide-fg-bright)" }}
            spellCheck={false}
            autoComplete="off"
            aria-label="Command search"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear" className="px-1" style={{ color: "var(--ide-fg-dim)" }}>
              ✕
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto py-1 ide-scroll" role="listbox">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm" style={{ color: "var(--ide-fg-dim)" }}>
              No matching commands
            </p>
          )}
          {filtered.map((it, i) => (
            <button
              key={it.key}
              role="option"
              aria-selected={i === idx}
              onMouseEnter={() => setIdx(i)}
              onClick={() => {
                it.run();
                if (it.key !== "theme" && it.key !== "side") onClose();
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-[13px]"
              style={{
                background: i === idx ? "var(--ide-explorer-hover)" : "transparent",
                color: "var(--ide-fg)",
              }}
            >
              {it.file ? <FileIcon file={it.file} size={15} /> : <span style={{ color: "var(--ide-accent)" }}>›</span>}
              <span className="flex-1 truncate">
                <span className="mr-2 opacity-50">{it.group}</span>
                {it.label}
              </span>
              {it.hint && (
                <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px]" style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)" }}>
                  {it.hint}
                </kbd>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t px-4 py-2 font-mono text-[10px]" style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)" }}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
