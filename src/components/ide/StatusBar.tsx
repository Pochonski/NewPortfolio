"use client";

import { GitBranch, XCircle, AlertTriangle, Bell, TerminalSquare } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { IDE_FILES, KIND_LANGUAGE, fileForRoute } from "@/lib/files";
import { useEditors } from "./editors-context";
import { getTermLines, subscribeTerminal } from "@/lib/terminal-store";
import { useEffect, useReducer } from "react";

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
          rel="noreferrer"
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
          <span style={errors > 0 ? { color: "var(--ide-error)" } : undefined}>{errors}</span>&nbsp;&nbsp;
          <AlertTriangle size={12} />
          <p>0</p>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onTerminal}
          className="flex items-center gap-1 rounded px-1"
          style={{
            color: terminalActive ? "var(--ide-accent)" : "var(--ide-fg-dim)",
          }}
          title={t("toggleTerminal")}
          aria-pressed={terminalActive}
        >
          <TerminalSquare size={12} /> {terminalActive ? "▼" : "▲"}
        </button>
        <span className="hidden sm:inline" title="Language mode">{language}</span>
        <span className="hidden sm:inline">UTF-8</span>
        <span title="Language">{locale.toUpperCase()}</span>
        <span title="Theme" style={{ color: "var(--ide-accent)" }}>
          {themeName}
        </span>
        <Bell size={12} />
      </div>
    </footer>
  );
}
