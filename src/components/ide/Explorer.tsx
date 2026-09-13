"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { IDE_FILES, IDE_FOLDERS } from "@/lib/files";
import { FileIcon, FolderIcon } from "./FileIcon";

export function Explorer() {
  const t = useTranslations("ide.explorer");
  const [open, setOpen] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [visible, setVisible] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const clean = pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/";

  useEffect(() => {
    const h = () => setVisible((v) => !v);
    window.addEventListener("porto-toggle-explorer", h);
    return () => window.removeEventListener("porto-toggle-explorer", h);
  }, []);

  const toggleFolder = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderFile = (f: (typeof IDE_FILES)[number], depth: number) => {
    const active = clean === f.route;
    return (
      <li key={f.id} role="treeitem" aria-selected={active} aria-level={depth + 1}>
        <Link
          href={f.route as "/"}
          onClick={(e) => {
            setDrawer(false);
            if (e.altKey) {
              e.preventDefault();
              window.dispatchEvent(
                new CustomEvent("porto-open-file", { detail: { fileId: f.id, toSide: true } })
              );
            }
          }}
          title={t("openSideHint", { file: f.filename })}
          className="flex items-center gap-2 py-[5px] pr-4 text-[13px]"
          style={{
            paddingLeft: `${12 + depth * 14}px`,
            background: active ? "var(--ide-explorer-hover)" : "transparent",
            color: active ? "var(--ide-fg-bright)" : "var(--ide-fg)",
            borderLeft: active ? "2px solid var(--ide-accent)" : "2px solid transparent",
          }}
        >
          <FileIcon file={f} />
          <span className="truncate font-mono">{f.filename}</span>
        </Link>
      </li>
    );
  };

  const list = (
    <div role="tree" aria-label={t("files")}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-1 px-3 py-2 text-[11px] font-bold tracking-wider uppercase"
        style={{ color: "var(--ide-fg-dim)" }}
      >
        <ChevronDown
          size={14}
          className="transition-transform"
          style={{ transform: open ? "none" : "rotate(-90deg)" }}
        />
        {t("portfolio")}
      </button>
      {open && (
        <ul className="pb-2">
          {IDE_FOLDERS.map((folder) => {
            const files = IDE_FILES.filter((f) => f.folder === folder.id);
            if (files.length === 0) return null;
            const isCollapsed = collapsed.has(folder.id);
            return (
              <li key={folder.id} role="treeitem" aria-expanded={!isCollapsed} aria-selected={false} aria-level={1}>
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="flex w-full items-center gap-1.5 py-[4px] pr-4 text-[13px]"
                  style={{ paddingLeft: "12px", color: "var(--ide-fg)" }}
                  title={folder.name}
                >
                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  <FolderIcon kind={folder.icon} open={!isCollapsed} />
                  <span className="truncate font-medium">{folder.name}</span>
                </button>
                {!isCollapsed && (
                  <ul role="group">{files.map((f) => renderFile(f, 1))}</ul>
                )}
              </li>
            );
          })}
          {/* Files without a known folder fall back to root level */}
          {IDE_FILES.filter((f) => !IDE_FOLDERS.some((g) => g.id === f.folder)).map((f) =>
            renderFile(f, 0)
          )}
        </ul>
      )}
    </div>
  );

  return (
    <>
      {visible && (
        <>
          <button
            className="shrink-0 border-r px-2 text-[11px] font-bold tracking-wider uppercase md:hidden"
            style={{
              background: "var(--ide-explorer)",
              borderColor: "var(--ide-border)",
              color: "var(--ide-fg-dim)",
            }}
            onClick={() => setDrawer(true)}
            aria-label={t("openExplorer")}
          >
            ☰
          </button>
          <aside
            aria-label={t("explorer")}
            className="w-56 shrink-0 overflow-y-auto border-r max-md:hidden ide-scroll"
            style={{ background: "var(--ide-explorer)", borderColor: "var(--ide-border)" }}
          >
            <p
              className="px-4 pt-3 pb-1 text-[11px] tracking-wider uppercase"
              style={{ color: "var(--ide-fg-dim)" }}
            >
              {t("explorer")}
            </p>
            {list}
          </aside>
          {drawer && (
            <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-label={t("explorer")}>
              <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
              <div
                className="absolute top-0 bottom-0 left-0 w-64 overflow-y-auto border-r"
                style={{ background: "var(--ide-explorer)", borderColor: "var(--ide-border)" }}
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: "var(--ide-fg-dim)" }}>
                    {t("explorer")}
                  </span>
                  <button onClick={() => setDrawer(false)} aria-label={t("closeExplorer")} className="px-2 py-1">
                    ✕
                  </button>
                </div>
                {list}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
