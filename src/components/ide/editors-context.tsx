"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { IDE_FILES, fileForRoute } from "@/lib/files";
import { DEFAULT_THEME, getSavedTheme } from "@/lib/themes";
import { pushRecent } from "@/lib/recents";
import {
  seedSource,
  sourceKey,
  type SourcePayload,
} from "@/lib/source-cache";

export type EditorTab = { kind: "code"; fileId: string } | { kind: "preview" };
export type GroupId = "left" | "right";

interface EditorsState {
  left: EditorTab[];
  right: EditorTab[] | null;
  activeLeft: number;
  activeRight: number;
  ratio: number;
  ready: boolean;
}

const STORE_KEY = "porto-editors";
const DEFAULT_RATIO = 50;

function isValidTab(t: unknown): t is EditorTab {
  if (!t || typeof t !== "object") return false;
  const o = t as Record<string, unknown>;
  if (o.kind === "preview") return true;
  return (
    o.kind === "code" &&
    typeof o.fileId === "string" &&
    IDE_FILES.some((f) => f.id === o.fileId)
  );
}

function clampIdx(tabs: EditorTab[], idx: number): number {
  if (tabs.length === 0) return 0;
  return Math.min(Math.max(idx, 0), tabs.length - 1);
}

function defaultState(fileId: string): EditorsState {
  return {
    left: [{ kind: "code", fileId }],
    right: [{ kind: "preview" }],
    activeLeft: 0,
    activeRight: 0,
    ratio: DEFAULT_RATIO,
    ready: false,
  };
}

function sanitize(raw: unknown): EditorsState | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.left) || !o.left.every(isValidTab)) return null;
  if (
    o.right !== null &&
    (!Array.isArray(o.right) || !o.right.every(isValidTab) || o.right.length === 0)
  ) {
    return null;
  }
  const ratio = typeof o.ratio === "number" ? Math.min(75, Math.max(25, o.ratio)) : DEFAULT_RATIO;
  const left = o.left as EditorTab[];
  const right = o.right as EditorTab[] | null;
  return {
    left,
    right,
    activeLeft: clampIdx(left, typeof o.activeLeft === "number" ? o.activeLeft : 0),
    activeRight: right ? clampIdx(right, typeof o.activeRight === "number" ? o.activeRight : 0) : 0,
    ratio,
    ready: true,
  };
}

/** Live IDE theme (hydration-safe default + porto-theme subscription). */
export function useLiveTheme(): string {
  const [theme, setTheme] = useState<string>(DEFAULT_THEME);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount sync
    setTheme(getSavedTheme());
    const h = (e: Event) => setTheme((e as CustomEvent).detail);
    window.addEventListener("porto-theme", h);
    return () => window.removeEventListener("porto-theme", h);
  }, []);
  return theme;
}

/** Registers server-rendered (or live) source into the shared cache. */
export function RegisterSource({
  fileId,
  code,
  codeHtml,
}: {
  fileId: string;
  code: string;
  codeHtml?: string;
}) {
  const locale = useLocale();
  const liveTheme = useLiveTheme();
  useEffect(() => {
    seedSource(sourceKey(locale, fileId, fileId === "settings" ? liveTheme : ""), {
      code,
      codeHtml,
    });
  }, [locale, fileId, code, codeHtml, liveTheme]);
  return null;
}

interface EditorsApi {
  state: EditorsState;
  lastActive: GroupId;
  setActive: (group: GroupId, idx: number) => void;
  openFile: (fileId: string, toSide?: boolean) => void;
  closeTab: (group: GroupId, idx: number) => void;
  moveTabToOtherSide: (group: GroupId, idx: number) => void;
  toggleSplit: () => void;
  setRatio: (n: number) => void;
}

const EditorsContext = createContext<EditorsApi | null>(null);

export function useEditors(): EditorsApi {
  const ctx = useContext(EditorsContext);
  if (!ctx) throw new Error("useEditors must be used inside EditorsProvider");
  return ctx;
}

export function EditorsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const routeFileId = fileForRoute(pathname).id;
  const [state, setState] = useState<EditorsState>(() => defaultState(routeFileId));
  const [lastActive, setLastActive] = useState<GroupId>("left");

  // Restore persisted workspace once, then reconcile current file on nav.
  useEffect(() => {
    let next: EditorsState | null = null;
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      const restored = raw ? sanitize(JSON.parse(raw)) : null;
      if (restored) {
        const hasCurrent =
          restored.left.some((t) => t.kind === "code" && t.fileId === routeFileId) ||
          restored.right?.some((t) => t.kind === "code" && t.fileId === routeFileId);
        next = hasCurrent
          ? restored
          : {
              ...restored,
              left: [...restored.left, { kind: "code", fileId: routeFileId }],
              activeLeft: restored.left.length,
            };
      }
    } catch {
      /* corrupted storage → fresh defaults */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe restore
    setState(next ?? { ...defaultState(routeFileId), ready: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reveal current file when navigating. Fills an empty left group;
  // otherwise appends when missing everywhere (does nothing if open).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- route reconcile
    setState((s) => {
      if (!s.ready) return s;
      if (s.left.length === 0) {
        pushRecent(routeFileId);
        return { ...s, left: [{ kind: "code", fileId: routeFileId }], activeLeft: 0 };
      }
      const present =
        s.left.some((t) => t.kind === "code" && t.fileId === routeFileId) ||
        s.right?.some((t) => t.kind === "code" && t.fileId === routeFileId);
      if (present) return s;
      pushRecent(routeFileId);
      return { ...s, left: [...s.left, { kind: "code", fileId: routeFileId }], activeLeft: s.left.length };
    });
  }, [pathname, routeFileId]);

  // Persist workspace.
  useEffect(() => {
    if (!state.ready) return;
    try {
      window.localStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          left: state.left,
          right: state.right,
          activeLeft: state.activeLeft,
          activeRight: state.activeRight,
          ratio: state.ratio,
        })
      );
    } catch {
      /* storage full/blocked */
    }
  }, [state]);

  const setActive = useCallback((group: GroupId, idx: number) => {
    setLastActive(group);
    setState((s) => {
      if (group === "left") return { ...s, activeLeft: clampIdx(s.left, idx) };
      if (!s.right) return s;
      return { ...s, activeRight: clampIdx(s.right, idx) };
    });
  }, []);

  const api = useMemo<EditorsApi>(() => {
    return {
      state,
      lastActive,
      setActive,
      openFile: (fileId: string, toSide = false) => {
        if (!IDE_FILES.some((f) => f.id === fileId)) return;
        pushRecent(fileId);
        const target: GroupId = toSide ? (lastActive === "left" ? "right" : "left") : lastActive;
        setLastActive(target);
        setState((s) => {
          if (target === "right" && !s.right) {
            return { ...s, right: [{ kind: "code", fileId }], activeRight: 0 };
          }
          const tabs = target === "left" ? s.left : (s.right ?? []);
          const existing = tabs.findIndex((t) => t.kind === "code" && t.fileId === fileId);
          if (existing >= 0) {
            return target === "left"
              ? { ...s, activeLeft: existing }
              : { ...s, activeRight: existing };
          }
          const tab: EditorTab = { kind: "code", fileId };
          return target === "left"
            ? { ...s, left: [...s.left, tab], activeLeft: s.left.length }
            : { ...s, right: [...(s.right ?? []), tab], activeRight: (s.right ?? []).length };
        });
      },
      closeTab: (group: GroupId, idx: number) => {
        setState((s) => {
          if (group === "left") {
            // Closing the last tab leaves an empty group with a welcome view.
            const left = s.left.filter((_, i) => i !== idx);
            return { ...s, left, activeLeft: clampIdx(left, s.activeLeft) };
          }
          if (!s.right) return s;
          if (s.right.length <= 1) return { ...s, right: null, activeRight: 0 };
          const right = s.right.filter((_, i) => i !== idx);
          return { ...s, right, activeRight: clampIdx(right, s.activeRight) };
        });
        if (group === "right") setLastActive("left");
      },
      moveTabToOtherSide: (group: GroupId, idx: number) => {
        setState((s) => {
          const from = group === "left" ? s.left : s.right;
          if (!from || from.length === 0 || idx < 0 || idx >= from.length) return s;
          const tab = from[idx];
          const dest: GroupId = group === "left" ? "right" : "left";
          const destTabs = dest === "left" ? s.left : (s.right ?? []);
          const next: EditorsState = {
            ...s,
            ...(dest === "left"
              ? { left: [...destTabs, tab], activeLeft: destTabs.length }
              : { right: [...destTabs, tab], activeRight: destTabs.length }),
          };
          if (from.length <= 1) {
            if (group === "right") {
              next.right = null;
              next.activeRight = 0;
            } else {
              next.left = [];
              next.activeLeft = 0;
            }
          } else {
            const kept = from.filter((_, i) => i !== idx);
            if (group === "left") {
              next.left = kept;
              next.activeLeft = clampIdx(kept, s.activeLeft);
            } else {
              next.right = kept;
              next.activeRight = clampIdx(kept, s.activeRight);
            }
          }
          return next;
        });
        setLastActive(group === "left" ? "right" : "left");
      },
      toggleSplit: () => {
        setState((s) =>
          s.right
            ? { ...s, right: null, activeRight: 0 }
            : { ...s, right: [{ kind: "preview" }], activeRight: 0 }
        );
        setLastActive((prev) => (prev === "left" ? "right" : "left"));
      },
      setRatio: (n: number) => {
        const ratio = Math.min(75, Math.max(25, Math.round(n)));
        setState((s) => (s.ratio === ratio ? s : { ...s, ratio }));
      },
    };
  }, [state, lastActive, setActive]);

  // Global events: porto-split (toggle) + porto-open-file (palette/terminal/explorer).
  useEffect(() => {
    const onSplit = () => api.toggleSplit();
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent).detail as { fileId?: string; toSide?: boolean } | undefined;
      if (d?.fileId) api.openFile(d.fileId, d.toSide);
    };
    window.addEventListener("porto-split", onSplit);
    window.addEventListener("porto-open-file", onOpen as EventListener);
    return () => {
      window.removeEventListener("porto-split", onSplit);
      window.removeEventListener("porto-open-file", onOpen as EventListener);
    };
  }, [api]);

  return <EditorsContext.Provider value={api}>{children}</EditorsContext.Provider>;
}
export type { SourcePayload };
