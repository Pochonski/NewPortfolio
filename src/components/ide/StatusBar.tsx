"use client";

import { GitBranch, XCircle, AlertTriangle, Bell, TerminalSquare } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { IDE_FILES, KIND_LANGUAGE, fileForRoute } from "@/lib/files";
import { useEditors } from "./editors-context";

export function StatusBar({
  onTerminal,
  terminalOpen,
  themeName,
}: {
  onTerminal: () => void;
  terminalOpen: boolean;
  themeName: string;
}) {
  const locale = useLocale();
  const { state } = useEditors();
  const pathname = usePathname();
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
          title="GitHub — main branch"
        >
          <GitBranch size={12} /> main
        </a>
        <span className="flex items-center gap-1" title="No errors">
          <XCircle size={12} /> 0 <AlertTriangle size={12} /> 0
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onTerminal}
          className="flex items-center gap-1 rounded px-1"
          style={{
            color: terminalOpen ? "var(--ide-accent)" : "var(--ide-fg-dim)",
          }}
          title="Toggle Terminal (Ctrl+`)"
          aria-pressed={terminalOpen}
        >
          <TerminalSquare size={12} /> {terminalOpen ? "▼" : "▲"}
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
