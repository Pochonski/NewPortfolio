"use client";

import { Clock, Files, GitBranch, XCircle, Bell, TerminalSquare } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { IDE_FILES, KIND_LANGUAGE, fileForRoute } from "@/lib/files";
import { useEditors } from "./editors-context";
import { getTermLines, subscribeTerminal } from "@/lib/terminal-store";
import { useEffect, useReducer, useState } from "react";

export function StatusBar({
  onTerminal,
  onProblems,
  terminalActive,
  themeName,
}: {
  onTerminal: () => void;
  onProblems: () => void;
  terminalActive: boolean;
  themeName: string;
}) {
  const locale = useLocale();
  const t = useTranslations("ide.status");
  const { state } = useEditors();
  const pathname = usePathname();
  const [, bump] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribeTerminal(bump), []);
  const [cursor, setCursor] = useState({ ln: 1, col: 1 });
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const update = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const node = sel.anchorNode;
      if (!node) return;
      const el = node instanceof Element ? node : node.parentElement;
      const lineEl = el?.closest?.(".codepane .line");
      const pane = el?.closest?.("[data-codepane]");
      if (!lineEl || !pane) return;
      const siblings = Array.from(pane.querySelectorAll(".line"));
      const ln = siblings.indexOf(lineEl) + 1;
      if (ln < 1) return;
      const range = sel.getRangeAt(0).cloneRange();
      try {
        range.selectNodeContents(lineEl);
        range.setEnd(sel.anchorNode, sel.anchorOffset);
      } catch {
        return;
      }
      setCursor((prev) => {
        const col = range.toString().length + 1;
        return prev.ln === ln && prev.col === col ? prev : { ln, col };
      });
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);
  useEffect(() => {
    const tick = () =>
      setNow(new Date().toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, [locale]);
  const errors = getTermLines().filter((l) => l.type === "err").length;
  const leftTab = state.left[state.activeLeft];
  const langFileId = leftTab?.kind === "code" ? leftTab.fileId : fileForRoute(pathname).id;
  const language = KIND_LANGUAGE[IDE_FILES.find((f) => f.id === langFileId)?.kind ?? "md"];
  return (
    <footer
      className="flex h-7 shrink-0 items-center justify-between border-t px-3 text-[11px] font-mono select-none max-md:mb-16"
      style={{
        background: "var(--ide-statusbar)",
        borderColor: "var(--ide-border)",
        color: "var(--ide-fg-dim)",
      }}
    >
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/Pochonski"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:opacity-100"
          title={t("githubMain")}
        >
          <GitBranch size={12} /> main
        </a>
        <button
          onClick={onProblems}
          title={errors > 0 ? t("problemsOpen", { count: errors }) : t("noProblemsOpen")}
          aria-label={t("openProblems")}
          className="flex items-center gap-1 rounded px-1 hover:opacity-100"
        >
          <XCircle size={12} style={errors > 0 ? { color: "var(--ide-error)" } : undefined} />
          <span style={errors > 0 ? { color: "var(--ide-error)" } : undefined}>{errors}</span>
        </button>
        <span
          className="hidden items-center gap-1 sm:flex"
          title={t("openFiles", { count: state.left.length })}
        >
          <Files size={12} /> {state.left.length}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden md:inline" title={t("cursor", { ln: cursor.ln, col: cursor.col })}>
          {t("cursorFmt", { ln: cursor.ln, col: cursor.col })}
        </span>
        <button
          onClick={onTerminal}
          className="flex items-center gap-1 rounded px-1"
          style={{
            color: terminalActive ? "var(--ide-accent)" : "var(--ide-fg-dim)",
          }}
          title={t("toggleTerminal")}
          aria-label={t("toggleTerminal")}
          aria-pressed={terminalActive}
        >
          <TerminalSquare size={12} /> {terminalActive ? "▼" : "▲"}
        </button>
        <span className="hidden sm:inline" title={t("langMode")}>{language}</span>
        <span className="hidden sm:inline" title={t("charset")}>UTF-8</span>
        <span title={t("langName")}>{locale.toUpperCase()}</span>
        <span title={t("themeName")} style={{ color: "var(--ide-accent)" }}>
          {themeName}
        </span>
        <span className="hidden items-center gap-1 sm:flex" title={t("clock")}>
          <Clock size={12} /> {now ?? "--:--"}
        </span>
        <Bell size={12} />
      </div>
    </footer>
  );
}
