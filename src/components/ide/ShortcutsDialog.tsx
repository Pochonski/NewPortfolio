"use client";

import { useEffect, useRef } from "react";
import { Keyboard, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFocusTrap } from "@/lib/use-focus-trap";

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations("shortcuts");
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const groups: { name: string; rows: [string, string][] }[] = [
    {
      name: t("general"),
      rows: [
        [t("palette"), "Ctrl+K"],
        [t("panel"), "Ctrl+`"],
        [t("split"), "Ctrl+\\"],
        [t("menu"), "Alt"],
      ],
    },
    {
      name: t("navigation"),
      rows: [[t("goFiles"), "G H/A/E…"]],
    },
    {
      name: t("editor"),
      rows: [
        [t("openSide"), "Alt+click"],
        [t("moveTab"), "2×click"],
      ],
    },
    {
      name: t("terminal"),
      rows: [
        [t("complete"), "Tab"],
        [t("clearTerm"), "Ctrl+L"],
        [t("cancel"), "Ctrl+C"],
        [t("history"), "↑ ↓"],
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
    >
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative w-full max-w-md overflow-hidden rounded-lg border shadow-2xl"
        style={{ background: "var(--ide-explorer)", borderColor: "var(--ide-border)" }}
      >
        <div
          className="flex items-center gap-2 border-b px-4 py-3"
          style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-bright)" }}
        >
          <Keyboard size={15} style={{ color: "var(--ide-accent)" }} />
          <span className="flex-1 text-sm font-semibold">{t("title")}</span>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="rounded p-1"
            style={{ color: "var(--ide-fg-dim)" }}
          >
            <X size={14} />
          </button>
        </div>
        <div className="ide-scroll max-h-96 overflow-y-auto px-4 py-3">
          {groups.map((g) => (
            <div key={g.name} className="mb-4 last:mb-1">
              <p
                className="mb-2 font-mono text-[10px] tracking-wider uppercase"
                style={{ color: "var(--ide-fg-dim)" }}
              >
                {g.name}
              </p>
              {g.rows.map(([label, keys]) => (
                <div key={label} className="flex items-center justify-between py-1 text-[13px]">
                  <span style={{ color: "var(--ide-fg)" }}>{label}</span>
                  <kbd
                    className="rounded border px-1.5 py-0.5 font-mono text-[11px]"
                    style={{ borderColor: "var(--ide-border)", color: "var(--ide-accent)" }}
                  >
                    {keys}
                  </kbd>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
