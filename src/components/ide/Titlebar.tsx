"use client";

import { fileForRoute } from "@/lib/files";
import { usePathname } from "@/i18n/navigation";

export function Titlebar({ onPalette }: { onPalette: () => void }) {
  const pathname = usePathname();
  const file = fileForRoute(pathname);

  return (
    <header
      className="flex h-9 shrink-0 items-center gap-3 border-b px-3 text-xs select-none"
      style={{
        background: "var(--ide-titlebar)",
        borderColor: "var(--ide-border)",
        color: "var(--ide-fg-dim)",
      }}
    >
      <span className="flex items-center gap-1.5" aria-hidden>
        <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </span>
      <nav className="hidden items-center gap-3 md:flex" aria-label="Menu">
        {["File", "Edit", "View", "Go", "Run", "Terminal", "Help"].map((m) => (
          <button
            key={m}
            onClick={m === "View" ? onPalette : undefined}
            className="rounded px-1 py-0.5 hover:opacity-100"
            style={{ color: "var(--ide-fg-dim)" }}
            title={m === "View" ? "Command Palette (Ctrl+K)" : m}
          >
            {m}
          </button>
        ))}
      </nav>
      <p className="flex-1 truncate text-center font-mono" aria-live="polite">
        {file.filename} — Joseph Fonseca — Visual Studio Code
      </p>
      <button
        onClick={onPalette}
        className="hidden rounded border px-2 py-0.5 font-mono sm:block"
        style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)" }}
        title="Open Command Palette (Ctrl+K)"
      >
        ⌘K
      </button>
    </header>
  );
}
