"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { IDE_FILES } from "@/lib/files";
import { FileIcon } from "./FileIcon";

export function Explorer() {
  const [open, setOpen] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();
  const clean = pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/";

  const list = (
    <div role="tree" aria-label="Portfolio files">
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
        Portfolio
      </button>
      {open && (
        <ul className="pb-2">
          {IDE_FILES.map((f) => {
            const active = clean === f.route;
            return (
              <li key={f.id} role="treeitem" aria-selected={active}>
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
                  title={`${f.filename} — Alt+click opens to the side`}
                  className="flex items-center gap-2 px-4 py-[5px] text-[13px]"
                  style={{
                    background: active ? "var(--ide-explorer-hover)" : "transparent",
                    color: active ? "var(--ide-fg-bright)" : "var(--ide-fg)",
                    borderLeft: active
                      ? "2px solid var(--ide-accent)"
                      : "2px solid transparent",
                  }}
                >
                  <FileIcon file={f} />
                  <span className="truncate font-mono">{f.filename}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <>
      <button
        className="shrink-0 border-r px-2 text-[11px] font-bold tracking-wider uppercase md:hidden"
        style={{
          background: "var(--ide-explorer)",
          borderColor: "var(--ide-border)",
          color: "var(--ide-fg-dim)",
        }}
        onClick={() => setDrawer(true)}
        aria-label="Open Explorer"
      >
        ☰
      </button>
      <aside
        aria-label="Explorer"
        className="w-56 shrink-0 overflow-y-auto border-r max-md:hidden ide-scroll"
        style={{ background: "var(--ide-explorer)", borderColor: "var(--ide-border)" }}
      >
        <p
          className="px-4 pt-3 pb-1 text-[11px] tracking-wider uppercase"
          style={{ color: "var(--ide-fg-dim)" }}
        >
          Explorer
        </p>
        {list}
      </aside>
      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-label="Explorer">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <div
            className="absolute top-0 bottom-0 left-0 w-64 overflow-y-auto border-r"
            style={{ background: "var(--ide-explorer)", borderColor: "var(--ide-border)" }}
          >
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: "var(--ide-fg-dim)" }}>
                Explorer
              </span>
              <button onClick={() => setDrawer(false)} aria-label="Close Explorer" className="px-2 py-1">
                ✕
              </button>
            </div>
            {list}
          </div>
        </div>
      )}
    </>
  );
}
