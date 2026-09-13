"use client";

import { X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { IDE_FILES } from "@/lib/files";
import { FileIcon } from "./FileIcon";

export function TabsBar() {
  const pathname = usePathname();
  const clean = pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/";

  return (
    <div
      role="tablist"
      aria-label="Open files"
      className="flex shrink-0 overflow-x-auto border-b ide-scroll"
      style={{ background: "var(--ide-tabs)", borderColor: "var(--ide-border)" }}
    >
      {IDE_FILES.map((f) => {
        const active = clean === f.route;
        return (
          <Link
            key={f.id}
            href={f.route as "/"}
            role="tab"
            aria-selected={active}
            className="flex shrink-0 items-center gap-2 border-r px-3 py-2 text-xs font-mono whitespace-nowrap"
            style={{
              background: active ? "var(--ide-tab-active)" : "transparent",
              borderColor: "var(--ide-border)",
              color: active ? "var(--ide-fg-bright)" : "var(--ide-fg-dim)",
              borderTop: active ? "1px solid var(--ide-accent)" : "1px solid transparent",
            }}
          >
            <FileIcon file={f} size={14} />
            {f.filename}
            {active && (
              <span aria-hidden style={{ color: "var(--ide-fg-dim)" }}>
                <X size={12} />
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
