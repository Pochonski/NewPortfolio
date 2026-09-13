"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Columns2,
  Maximize,
  Minimize,
  Minus,
  PanelBottom,
  PanelLeft,
  Search,
  Settings,
  X,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { fileForRoute } from "@/lib/files";
import { clearTermLines } from "@/lib/terminal-store";
import { ShortcutsDialog } from "./ShortcutsDialog";

interface MenuItemDef {
  label: string;
  hint?: string;
  disabled?: boolean;
  checked?: boolean;
  separator?: boolean;
  action?: () => void;
}

function openPanel(tab: "problems" | "output" | "terminal") {
  window.dispatchEvent(new CustomEvent("porto-panel", { detail: { tab } }));
}

// Arch Linux custom titlebar: app icon + menubar | command center | layout + window controls.
export function Titlebar({ onPalette, onTerminal }: { onPalette: () => void; onTerminal: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const file = fileForRoute(pathname);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isFs, setIsFs] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const menubarRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = () => setShortcutsOpen(true);
    window.addEventListener("porto-shortcuts", h);
    return () => window.removeEventListener("porto-shortcuts", h);
  }, []);

  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // Alt focuses the menubar (VS Code behavior).
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const inField = e.target instanceof Element && !!e.target.closest("input, textarea");
      if (e.key === "Alt" && !e.ctrlKey && !e.metaKey && !e.repeat && !inField) {
        e.preventDefault();
        setOpenMenu((m) => (m ? null : "File"));
        if (!openMenu) {
          setTimeout(() => menubarRef.current?.querySelector<HTMLButtonElement>("button")?.focus(), 0);
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [openMenu ]);

  // Close on outside click. The item's own onClick (React root listener) runs
  // before this document listener, so actions always fire first. Clicks
  // inside the menubar are ignored — the toggle buttons manage those.
  useEffect(() => {
    if (!openMenu) return;
    const close = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest("[data-menubar]")) return;
      setOpenMenu(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenu ]);

  const toggleFs = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const toggleExplorer = () => window.dispatchEvent(new CustomEvent("porto-toggle-explorer"));
  const toggleSplit = () => window.dispatchEvent(new CustomEvent("porto-split"));

  const menus: { id: string; label: string; items: MenuItemDef[] }[] = [
    {
      id: "File",
      label: "File",
      items: [
        { label: "Download CV", action: () => window.open("/cv/Joseph-Fonseca-CV.pdf", "_blank", "noopener") },
        { label: "", separator: true },
        { label: "New Window", disabled: true },
        { label: "Open File…", disabled: true },
        { label: "Save", hint: "Ctrl+S", disabled: true },
        { label: "", separator: true },
        { label: "Exit", disabled: true },
      ],
    },
    {
      id: "Edit",
      label: "Edit",
      items: [
        { label: "Undo", hint: "Ctrl+Z", disabled: true },
        { label: "Redo", hint: "Ctrl+Y", disabled: true },
        { label: "", separator: true },
        { label: "Cut", hint: "Ctrl+X", disabled: true },
        { label: "Copy", hint: "Ctrl+C", disabled: true },
        { label: "Paste", hint: "Ctrl+V", disabled: true },
        { label: "", separator: true },
        { label: "Find in Files…", hint: "Ctrl+K", action: onPalette },
      ],
    },
    {
      id: "Selection",
      label: "Selection",
      items: [
        {
          label: "Select All",
          hint: "Ctrl+A",
          action: () => document.getSelection()?.selectAllChildren(document.body),
        },
        { label: "Expand Selection", disabled: true },
        { label: "Shrink Selection", disabled: true },
      ],
    },
    {
      id: "View",
      label: "View",
      items: [
        { label: "Command Palette…", hint: "Ctrl+K", action: onPalette },
        { label: "Terminal", hint: "Ctrl+`", action: onTerminal },
        { label: "Split Editor", hint: "Ctrl+\\", action: toggleSplit },
        { label: "", separator: true },
        { label: "Explorer", action: toggleExplorer },
        { label: "Full Screen", hint: "F11", checked: isFs, action: toggleFs },
      ],
    },
    {
      id: "Go",
      label: "Go",
      items: [
        { label: "Back", hint: "Alt+←", action: () => router.back() },
        { label: "Forward", hint: "Alt+→", action: () => router.forward() },
        { label: "", separator: true },
        { label: "home.tsx", action: () => router.push("/" as const) },
        { label: "about.md", action: () => router.push("/about" as const) },
        { label: "experience.json", action: () => router.push("/experience" as const) },
        { label: "projects.js", action: () => router.push("/projects" as const) },
        { label: "contact.css", action: () => router.push("/contact" as const) },
      ],
    },
    {
      id: "Run",
      label: "Run",
      items: [
        { label: "Reload Window", action: () => window.location.reload() },
        { label: "", separator: true },
        { label: "Start Debugging", hint: "F5", disabled: true },
        { label: "Run Without Debugging", hint: "Ctrl+F5", disabled: true },
      ],
    },
    {
      id: "Terminal",
      label: "Terminal",
      items: [
        {
          label: "New Terminal",
          action: () => {
            clearTermLines();
            openPanel("terminal");
          },
        },
        { label: "Clear", action: () => clearTermLines() },
        { label: "", separator: true },
        { label: "Toggle Terminal", hint: "Ctrl+`", action: onTerminal },
      ],
    },
    {
      id: "Help",
      label: "Help",
      items: [
        { label: "About Joseph", action: () => router.push("/about" as const) },
        { label: "Keyboard Shortcuts", action: () => setShortcutsOpen(true) },
        { label: "", separator: true },
        {
          label: "Report Issue",
          action: () => window.open("https://github.com/Pochonski/NewPortfolio/issues/new", "_blank", "noopener"),
        },
      ],
    },
  ];

  const focusables = (root: HTMLElement | null): HTMLElement[] => {
    if (!root) return [];
    return [...root.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')];
  };

  const runItem = (item: MenuItemDef) => {
    if (item.disabled || item.separator) return;
    setOpenMenu(null);
    item.action?.();
  };

  return (
    <header
      className="flex h-9 shrink-0 items-center gap-2 border-b px-3 text-xs select-none"
      style={{
        background: "var(--ide-titlebar)",
        borderColor: "var(--ide-border)",
        color: "var(--ide-fg-dim)",
      }}
    >
      {/* Left: app icon + menubar */}
      <Link
        href="/"
        aria-label="Home"
        title="Portfolio — Home"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] text-[11px] font-bold"
        style={{ background: "var(--ide-accent)", color: "var(--ide-button-fg)" }}
      >
        JF
      </Link>
      <div ref={menubarRef} role="menubar" aria-label="Application menu" data-menubar className="hidden items-center md:flex">
        {menus.map((m) => (
          <div key={m.id} className="relative">
            <button
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={openMenu === m.id}
              onClick={() => setOpenMenu((o) => (o === m.id ? null : m.id))}
              onMouseEnter={() => {
                if (openMenu) setOpenMenu(m.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setOpenMenu(m.id);
                  setTimeout(() => focusables(menuRef.current)[0]?.focus(), 0);
                } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const btns = [...(menubarRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"][aria-haspopup]') ?? [])];
                  const i = btns.indexOf(e.currentTarget);
                  const next = btns[(i + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length];
                  next?.focus();
                  if (openMenu) setOpenMenu(menus[menus.findIndex((x) => x.id === m.id) + (e.key === "ArrowRight" ? 1 : -1)]?.id ?? m.id);
                } else if (e.key === "Escape") {
                  setOpenMenu(null);
                } else if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenMenu((o) => (o === m.id ? null : m.id));
                }
              }}
              className="rounded px-2 py-1"
              style={{
                color: openMenu === m.id ? "var(--ide-fg-bright)" : "var(--ide-fg-dim)",
                background: openMenu === m.id ? "var(--ide-explorer-hover)" : "transparent",
              }}
            >
              {m.label}
            </button>
            {openMenu === m.id && (
              <div
                ref={menuRef}
                role="menu"
                aria-label={m.label}
                data-menubar
                className="absolute top-full left-0 z-50 mt-1 min-w-60 overflow-hidden rounded-md border py-1 shadow-2xl"
                style={{ background: "var(--ide-explorer)", borderColor: "var(--ide-border)" }}
              >
                {m.items.map((item, i) =>
                  item.separator ? (
                    <div key={i} role="separator" className="mx-2 my-1 h-px" style={{ background: "var(--ide-border)" }} />
                  ) : (
                    <button
                      key={i}
                      role="menuitem"
                      aria-disabled={item.disabled}
                      onClick={() => runItem(item)}
                      onMouseEnter={(e) => !item.disabled && e.currentTarget.focus()}
                      onKeyDown={(e) => {
                        const items = focusables(menuRef.current);
                        const at = items.indexOf(e.currentTarget);
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          items[(at + 1) % items.length]?.focus();
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          items[(at + items.length - 1) % items.length]?.focus();
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setOpenMenu(null);
                          menubarRef.current
                            ?.querySelectorAll<HTMLButtonElement>('[role="menuitem"][aria-haspopup]')
                            [menus.findIndex((x) => x.id === m.id)]?.focus();
                        } else if (e.key === "Tab") {
                          setOpenMenu(null);
                        }
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12.5px]"
                      style={{ color: item.disabled ? "var(--ide-fg-dim)" : "var(--ide-fg)", opacity: item.disabled ? 0.45 : 1 }}
                    >
                      <span className="w-4 shrink-0">{item.checked && <Check size={13} style={{ color: "var(--ide-accent)" }} />}</span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.hint && (
                        <kbd className="font-mono text-[10px]" style={{ color: "var(--ide-fg-dim)" }}>
                          {item.hint}
                        </kbd>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Center: command center (desktop) / title (mobile) */}
      <button
        onClick={onPalette}
        title="Command Palette (Ctrl+K)"
        className="mx-auto hidden w-full max-w-md items-center gap-2 rounded-md border px-3 py-1 font-mono text-[11px] md:flex"
        style={{ borderColor: "var(--ide-border)", background: "var(--ide-bg)", color: "var(--ide-fg-dim)" }}
      >
        <Search size={12} />
        <span className="flex-1 truncate text-center">Search files or commands</span>
        <kbd className="text-[10px]">Ctrl+K</kbd>
      </button>
      <p className="flex-1 truncate text-center font-mono md:hidden" aria-live="polite">
        {file.filename}
      </p>

      {/* Right: layout controls + settings + window (Arch: right side) */}
      <div className="hidden items-center gap-0.5 md:flex" style={{ color: "var(--ide-fg-dim)" }}>
        <button onClick={toggleExplorer} title="Toggle Explorer" aria-label="Toggle Explorer" className="rounded p-1.5 hover:opacity-100">
          <PanelLeft size={14} />
        </button>
        <button onClick={onTerminal} title="Toggle Panel (Ctrl+`)" aria-label="Toggle panel" className="rounded p-1.5 hover:opacity-100">
          <PanelBottom size={14} />
        </button>
        <button onClick={toggleSplit} title="Toggle Split Editor (Ctrl+\)" aria-label="Toggle split editor" className="rounded p-1.5 hover:opacity-100">
          <Columns2 size={14} />
        </button>
        <Link href="/settings" title="Settings" aria-label="Settings" className="rounded p-1.5 hover:opacity-100">
          <Settings size={14} />
        </Link>
        <span aria-hidden className="mx-1 h-4 w-px" style={{ background: "var(--ide-border)" }} />
        <span title="Minimize (unavailable in browser)" aria-hidden className="cursor-default rounded p-1.5 opacity-40">
          <Minus size={14} />
        </span>
        <button
          onClick={toggleFs}
          title={isFs ? "Exit full screen" : "Full screen"}
          aria-label={isFs ? "Exit full screen" : "Full screen"}
          aria-pressed={isFs}
          className="rounded p-1.5 hover:opacity-100"
        >
          {isFs ? <Minimize size={13} /> : <Maximize size={13} />}
        </button>
        <span title="Close (unavailable in browser)" aria-hidden className="cursor-default rounded p-1.5 opacity-40 hover:opacity-70">
          <X size={14} />
        </span>
      </div>
      {shortcutsOpen && <ShortcutsDialog onClose={() => setShortcutsOpen(false)} />}
    </header>
  );
}
