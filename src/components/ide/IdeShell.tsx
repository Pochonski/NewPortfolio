"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Titlebar } from "./Titlebar";
import { ActivityBar } from "./ActivityBar";
import { Explorer } from "./Explorer";
import { TabsBar } from "./TabsBar";
import { StatusBar } from "./StatusBar";
import { TerminalPanel } from "./TerminalPanel";
import { CommandPalette } from "./CommandPalette";
import { EditorsProvider } from "./editors-context";
import { IDE_THEMES, DEFAULT_THEME, getSavedTheme } from "@/lib/themes";

const CHORDS: Record<string, string> = {
  h: "/",
  a: "/about",
  e: "/experience",
  s: "/skills",
  p: "/projects",
  g: "/github",
  c: "/contact",
  t: "/settings",
};

export function IdeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [terminal, setTerminal] = useState(false);
  const [palette, setPalette] = useState(false);
  const [theme, setTheme] = useState<string>(DEFAULT_THEME);
  const [chord, setChord] = useState<string | null>(null);

  // Theme name shown in the status bar. The real <html data-theme> is applied
  // by the inline theme script + applyTheme(); here we only mirror the value
  // via subscription (setState inside the event callback is allowed).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount sync
    setTheme(getSavedTheme());
    const h = (e: Event) => setTheme((e as CustomEvent).detail);
    window.addEventListener("porto-theme", h);
    return () => window.removeEventListener("porto-theme", h);
  }, []);

  useEffect(() => {
    const el = document.getElementById("ide-editor");
    if (el) el.scrollTop = 0;
  }, [pathname]);

  const toggleTerminal = useCallback(() => setTerminal((v) => !v), []);
  const openPalette = useCallback(() => setPalette(true), []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const h = (e: KeyboardEvent) => {
      const inField = e.target instanceof Element && !!e.target.closest("input, textarea");
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        toggleTerminal();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("porto-split"));
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "k" || (e.shiftKey && e.key.toLowerCase() === "p"))) {
        if (!inField || e.key.toLowerCase() === "k") {
          e.preventDefault();
          setPalette(true);
          return;
        }
      }
      if (palette || inField) return;
      const k = e.key.toLowerCase();
      if (chord === "g" && CHORDS[k]) {
        e.preventDefault();
        router.push(CHORDS[k] as "/");
        setChord(null);
        return;
      }
      if (chord === "k" && k === "t") {
        e.preventDefault();
        setPalette(true);
        setChord(null);
        return;
      }
      if ((k === "g" || k === "k") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setChord(k);
        clearTimeout(t);
        t = setTimeout(() => setChord(null), 1500);
        return;
      }
      if (chord) setChord(null);
    };
    window.addEventListener("keydown", h);
    return () => {
      window.removeEventListener("keydown", h);
      clearTimeout(t);
    };
  }, [palette, chord, router, toggleTerminal]);

  const themeName = IDE_THEMES.find((t) => t.id === theme)?.name ?? theme;

  return (
    <div className="flex h-dvh flex-col" style={{ background: "var(--ide-bg)", color: "var(--ide-fg)" }}>
      <Titlebar onPalette={openPalette} />
      <EditorsProvider>
        <div className="flex min-h-0 flex-1">
          <ActivityBar />
          <Explorer />
          <div className="flex min-w-0 flex-1 flex-col">
            <TabsBar />
            <div className="flex min-h-0 flex-1 flex-col">
              <main id="ide-editor" className="min-h-0 flex-1 overflow-y-auto ide-scroll">
                {children}
              </main>
              {terminal && <TerminalPanel onClose={() => setTerminal(false)} />}
            </div>
          </div>
        </div>
        <StatusBar onTerminal={toggleTerminal} terminalOpen={terminal} themeName={themeName} />
      </EditorsProvider>
      {palette && <CommandPalette open onClose={() => setPalette(false)} onTerminal={toggleTerminal} />}
      {chord && (
        <div
          className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded border px-3 py-1 font-mono text-xs"
          style={{ background: "var(--ide-explorer)", borderColor: "var(--ide-border)", color: "var(--ide-fg)" }}
          aria-live="polite"
        >
          {chord} — {chord === "g" ? "press h/a/e/s/p/g/c/t" : "press t for theme"}
        </div>
      )}
    </div>
  );
}
