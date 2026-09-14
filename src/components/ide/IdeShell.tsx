"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Titlebar } from "./Titlebar";
import { ActivityBar } from "./ActivityBar";
import { Explorer } from "./Explorer";
import { StatusBar } from "./StatusBar";
import { BottomPanel, type PanelTab } from "./BottomPanel";
import { CommandPalette } from "./CommandPalette";
import { EditorsProvider } from "./editors-context";
import { logOutput } from "@/lib/output-log";
import { trackEvent } from "@/lib/analytics";
import { useTranslations } from "next-intl";
import { IDE_THEMES, DEFAULT_THEME, getSavedTheme } from "@/lib/themes";
import { STORE_PANEL } from "@/lib/storage-keys";

const PANEL_STORE_KEY = STORE_PANEL;

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
  const [palette, setPalette] = useState(false);
  const [theme, setTheme] = useState<string>(DEFAULT_THEME);
  const [chord, setChord] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<PanelTab>("terminal");
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const [panelMax, setPanelMax] = useState(false);

  const openPanel = useCallback((tab: PanelTab) => {
    setPanelTab(tab);
    setPanelOpen(true);
  }, []);

  // Theme name shown in the status bar. The real <html data-theme> is applied
  // by the inline theme script + applyTheme(); here we only mirror the value
  // via subscription (setState inside the event callback is allowed).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount sync
    setTheme(getSavedTheme());
    const onTheme = (e: Event) => {
      const id = (e as CustomEvent).detail as string;
      setTheme(id);
      logOutput(`Theme set to ${id}`);
      trackEvent("theme_change", { theme: id });
    };
    const onLog = (e: Event) => {
      const message = (e as CustomEvent).detail?.message;
      if (typeof message === "string" && message) logOutput(message);
    };
    window.addEventListener("porto-theme", onTheme);
    window.addEventListener("porto-log", onLog as EventListener);
    const onPanel = (e: Event) => {
      const tab = (e as CustomEvent).detail?.tab;
      if (tab === "problems" || tab === "output" || tab === "terminal") {
        openPanel(tab);
      }
    };
    window.addEventListener("porto-panel", onPanel as EventListener);
    try {
      const raw = window.localStorage.getItem(PANEL_STORE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { tab?: PanelTab; height?: number | null; max?: boolean };
        if (p.tab === "problems" || p.tab === "output" || p.tab === "terminal") {
          setPanelTab(p.tab);
        }
        if (typeof p.height === "number") setPanelHeight(Math.min(70, Math.max(12, p.height)));
        if (p.max === true) setPanelMax(true);
      }
    } catch {
      /* corrupted storage → defaults */
    }
    return () => {
      window.removeEventListener("porto-theme", onTheme);
      window.removeEventListener("porto-log", onLog as EventListener);
      window.removeEventListener("porto-panel", onPanel as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PANEL_STORE_KEY,
        JSON.stringify({ tab: panelTab, height: panelHeight, max: panelMax })
      );
    } catch {
      /* storage blocked */
    }
  }, [panelTab, panelHeight, panelMax]);

  useEffect(() => {
    const el = document.getElementById("ide-editor");
    if (el) el.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    logOutput(`Navigated to ${pathname}`);
  }, [pathname]);

  const toggleTerminal = useCallback(() => {
    if (panelOpen && panelTab === "terminal") {
      setPanelOpen(false);
    } else {
      setPanelTab("terminal");
      setPanelOpen(true);
    }
  }, [panelOpen, panelTab]);
  const openPalette = useCallback(() => setPalette(true), []);
  const t = useTranslations("ide.shell");

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
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "f") {
        if (!palette) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("porto-sidebar", { detail: { view: "search" } }));
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "f") {
        if (inField || palette) return;
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("porto-find"));
        return;
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
      <a
        href="#ide-editor"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("ide-editor")?.focus();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-1 focus:z-[60] focus:rounded focus:px-3 focus:py-1.5 focus:font-mono focus:text-xs"
        style={{ background: "var(--ide-explorer)", color: "var(--ide-accent)" }}
      >
        {t("skipToEditor")}
      </a>
      <Titlebar onPalette={openPalette} onTerminal={toggleTerminal} />
      <EditorsProvider>
        <div className="flex min-h-0 flex-1">
          <ActivityBar />
          <Explorer />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col">
              <main id="ide-editor" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto ide-scroll outline-none">
                {children}
              </main>
              {panelOpen && (
                <BottomPanel
                  tab={panelTab}
                  onTab={setPanelTab}
                  onClose={() => setPanelOpen(false)}
                  heightVh={panelHeight}
                  onHeight={setPanelHeight}
                  maximized={panelMax}
                  onToggleMax={() => setPanelMax((v) => !v)}
                />
              )}
            </div>
          </div>
        </div>
        <StatusBar
          onTerminal={toggleTerminal}
          onProblems={() => openPanel("problems")}
          terminalActive={panelOpen && panelTab === "terminal"}
          themeName={themeName}
        />
      </EditorsProvider>
      {palette && <CommandPalette open onClose={() => setPalette(false)} onTerminal={toggleTerminal} />}
      {chord && (
        <div
          className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded border px-3 py-1 font-mono text-xs"
          style={{ background: "var(--ide-explorer)", borderColor: "var(--ide-border)", color: "var(--ide-fg)" }}
          aria-live="polite"
        >
          {chord} — {chord === "g" ? t("chordGo") : t("chordTheme")}
        </div>
      )}
    </div>
  );
}
