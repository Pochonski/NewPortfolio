"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Code2,
  Columns2,
  Copy,
  Eye,
  Globe,
  X,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { IDE_FILES, IDE_FOLDERS, KIND_LANGUAGE, fileForRoute, siteForId, siteHost } from "@/lib/files";
import { FileIcon } from "./FileIcon";
import { BrowserToolbar } from "./BrowserToolbar";
import { SiteBrowser } from "./SiteBrowser";
import { focusedSiteGroup } from "./editors-context";
import {
  useEditors,
  useLiveTheme,
  type EditorTab,
  type GroupId,
} from "./editors-context";
import { readRecents } from "@/lib/recents";
import {
  fetchSource,
  readSource,
  sourceKey,
  subscribeSource,
} from "@/lib/source-cache";

const SITE_URL = "https://joseph-fonseca-dev.vercel.app";

function fileOf(tab: EditorTab) {
  return tab.kind === "code" ? IDE_FILES.find((f) => f.id === tab.fileId) : undefined;
}

// ---------------------------------------------------------------------------
// Code tab content: cached highlighted HTML, fetched on demand (SWR-lite).
// ---------------------------------------------------------------------------
function CodeTabContent({ fileId }: { fileId: string }) {
  const locale = useLocale();
  const liveTheme = useLiveTheme();
  const ts = useTranslations("ide.split");
  const tag = fileId === "settings" ? liveTheme : "";
  const key = sourceKey(locale, fileId, tag);
  const [, bump] = useReducer((x: number) => x + 1, 0);
  const [failed, setFailed] = useState(false);

  useEffect(() => subscribeSource(bump), []);

  const entry = readSource(key);

  useEffect(() => {
    if (entry?.codeHtml || failed) return;
    let cancelled = false;
    fetchSource(key, fileId, locale, fileId === "settings" ? liveTheme : "porto-dark").catch(
      () => {
        if (!cancelled) setFailed(true);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [key, fileId, locale, liveTheme, entry?.codeHtml, failed]);

  return (
    <>
      {entry?.codeHtml ? (
        <div
          data-codepane={fileId}
          className="codepane ide-scroll min-h-0 flex-1 overflow-auto px-4 py-3 font-mono text-[13px] leading-[1.7] max-lg:overflow-visible"
          dangerouslySetInnerHTML={{ __html: entry.codeHtml }}
        />
      ) : entry?.code ? (
        <div data-codepane={fileId} className="ide-scroll min-h-0 flex-1 overflow-auto px-4 py-3 max-lg:overflow-visible">
          <pre className="font-mono text-[13px] leading-[1.7]" style={{ color: "var(--ide-fg)" }}>
            {entry.code}
          </pre>
        </div>
      ) : failed ? (
        <p className="p-4 font-mono text-xs" style={{ color: "var(--ide-error)" }}>
          {ts("failedLoad")}
        </p>
      ) : (
        <div className="flex flex-1 flex-col gap-2 p-4" aria-label={ts("loadingSource")}>
          {[90, 70, 80, 55, 75].map((w, i) => (
            <div
              key={i}
              className="h-3 animate-pulse rounded"
              style={{ width: `${w}%`, background: "var(--ide-border)" }}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb actions for code tabs: live line count + copy, subscribed to the
// source cache so they appear as soon as the file loads.
// ---------------------------------------------------------------------------
function CodeMeta({ fileId }: { fileId: string }) {
  const locale = useLocale();
  const liveTheme = useLiveTheme();
  const ts = useTranslations("ide.split");
  const tag = fileId === "settings" ? liveTheme : "";
  const [, bump] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribeSource(bump), []);
  const entry = readSource(sourceKey(locale, fileId, tag));
  const lines = entry?.code ? entry.code.split("\n").length : 0;
  return (
    <span className="ml-auto flex shrink-0 items-center gap-1 pl-3">
      {lines > 0 && (
        <span className="font-mono text-[10px]" style={{ color: "var(--ide-fg-dim)" }}>
          {ts("codeLines", { n: lines })}
        </span>
      )}
      <PaneCopyButton fileId={fileId} tag={tag} />
    </span>
  );
}

function PaneCopyButton({ fileId, tag }: { fileId: string; tag: string }) {
  const locale = useLocale();
  const ts = useTranslations("ide.split");
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        const entry = readSource(sourceKey(locale, fileId, tag));
        if (!entry?.code) return;
        try {
          await navigator.clipboard.writeText(entry.code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          /* clipboard unavailable */
        }
      }}
      title={ts("copyCode")}
      aria-label={ts("copyCode")}
      className="rounded p-1.5 transition-opacity hover:opacity-100"
      style={{ color: "var(--ide-fg-dim)" }}
    >
      {copied ? <Check size={13} style={{ color: "var(--ide-success)" }} /> : <Copy size={13} />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Portfolio preview toolbar: shared browser chrome + load progress.
// ---------------------------------------------------------------------------
function BrowserBar() {
  const pathname = usePathname();
  const router = useRouter();
  const ts = useTranslations("ide.split");
  const [spinning, setSpinning] = useState(false);
  const [spinId, setSpinId] = useState(0);
  const url = `${SITE_URL}${pathname}`;

  const reload = useCallback(() => {
    router.refresh();
    setSpinning(true);
    setSpinId((i) => i + 1);
    setTimeout(() => setSpinning(false), 700);
  }, [router]);

  useEffect(() => {
    const h = () => reload();
    window.addEventListener("porto-reload-preview", h);
    return () => window.removeEventListener("porto-reload-preview", h);
  }, [reload]);

  return (
    <div className="relative shrink-0">
      <BrowserToolbar
        url={url}
        badge="200"
        onReload={reload}
        spinning={spinning}
        reloadLabel={ts("reloadPreview")}
      />
      {spinning && <span key={spinId} className="browser-progress" aria-hidden />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Draggable sash between groups (VS Code splitter).
// ---------------------------------------------------------------------------
function Sash({ ratio, onRatio }: { ratio: number; onRatio: (n: number) => void }) {
  const ts = useTranslations("ide.split");
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [hot, setHot] = useState(false);

  const ratioFromClientX = useCallback(
    (clientX: number) => {
      const parent = ref.current?.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.width === 0) return;
      onRatio(((clientX - rect.left) / rect.width) * 100);
    },
    [onRatio]
  );

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-label={ts("resizeGroups")}
      aria-valuenow={Math.round(ratio)}
      aria-valuemin={25}
      aria-valuemax={75}
      tabIndex={0}
      onPointerDown={(e) => {
        dragging.current = true;
        setHot(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (dragging.current) ratioFromClientX(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
        setHot(false);
      }}
      onPointerCancel={() => {
        dragging.current = false;
        setHot(false);
      }}
      onDoubleClick={() => onRatio(50)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onRatio(ratio - 2);
        else if (e.key === "ArrowRight") onRatio(ratio + 2);
        else if (e.key === "Home") onRatio(50);
      }}
      className="z-10 flex w-[9px] shrink-0 cursor-col-resize items-stretch justify-center outline-none max-lg:hidden"
      title={ts("resizeHint")}
    >
      <div
        className="w-px transition-colors"
        style={{ background: hot ? "var(--ide-accent)" : "var(--ide-border)" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Welcome view for empty groups: recents + shortcuts, VS Code style.
// ---------------------------------------------------------------------------
function WelcomeView() {
  const { openFile } = useEditors();
  const ts = useTranslations("ide.split");
  const [recents] = useState<string[]>(() => readRecents().slice().reverse());

  return (
    <div className="ide-scroll flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-auto p-8 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold"
        style={{ background: "var(--ide-accent)", color: "var(--ide-button-fg)" }}
        aria-hidden
      >
        JF
      </div>
      <div>
        <p className="text-base font-semibold" style={{ color: "var(--ide-fg-bright)" }}>
          {ts("noEditors")}
        </p>
        <p className="mt-1 font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
          Ctrl+K · Ctrl+Shift+F · Ctrl+`
        </p>
      </div>
      {recents.length > 0 && (
        <div suppressHydrationWarning className="w-full max-w-xs">
          <p
            className="mb-2 text-left font-mono text-[10px] tracking-wider uppercase"
            style={{ color: "var(--ide-fg-dim)" }}
          >
            {ts("recent")}
          </p>
          {recents.slice(0, 5).map((id) => {
            const file = IDE_FILES.find((f) => f.id === id);
            if (!file) return null;
            return (
              <button
                key={id}
                onClick={() => openFile(id)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[13px] hover:opacity-100"
                style={{ color: "var(--ide-fg)" }}
              >
                <FileIcon file={file} size={14} />
                <span className="truncate font-mono">{file.filename}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// One editor group: tab bar + breadcrumb + content.
// ---------------------------------------------------------------------------
function GroupView({
  group,
  preview,
  mobileVisible,
}: {
  group: GroupId;
  preview: React.ReactNode;
  mobileVisible: boolean;
}) {
  const { state, setActive, closeTab, moveTabToOtherSide, toggleSplit } = useEditors();
  const pathname = usePathname();
  const ts = useTranslations("ide.split");
  const routeFile = fileForRoute(pathname);
  const tabs = group === "left" ? state.left : (state.right ?? []);
  const activeIdx = group === "left" ? state.activeLeft : state.activeRight;
  const active = tabs[Math.min(activeIdx, tabs.length - 1)];

  // Right is a fixed single browser slot: no VS Code tab bar, just the browser.
  if (group === "right") {
    return (
      <section
        aria-label={ts("editorGroup") + " 2"}
        className={`min-h-0 min-w-0 flex-1 flex-col overflow-hidden max-lg:w-full ${
          mobileVisible ? "flex" : "hidden"
        } lg:flex`}
        style={{ background: "var(--ide-editor)" }}
      >
        {active?.kind === "site" ? (
          <SiteBrowser siteId={active.siteId} />
        ) : active?.kind === "code" ? (
          <CodeTabContent fileId={active.fileId} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <BrowserBar />
            <div className="ide-scroll min-h-0 flex-1 overflow-auto p-4 max-lg:overflow-visible lg:p-6">
              <div className="mx-auto w-full max-w-3xl">{preview}</div>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      aria-label={`${ts("editorGroup")} ${group === "left" ? 1 : 2}`}
      className={`min-h-0 min-w-0 flex-1 flex-col overflow-hidden max-lg:w-full ${
        mobileVisible ? "flex" : "hidden"
      } lg:flex`}
      style={{ background: "var(--ide-editor)" }}
    >
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label={group === "left" ? ts("group1") : ts("group2")}
        className="flex shrink-0 items-stretch overflow-x-auto ide-scroll"
        style={{ background: "var(--ide-tabs)" }}
      >
        {tabs.map((tab, i) => {
          const file = fileOf(tab);
          const isActive = i === Math.min(activeIdx, tabs.length - 1);
          const site = tab.kind === "site" ? siteForId(tab.siteId) : undefined;
          const tabName =
            tab.kind === "code"
              ? (file?.filename ?? ts("editor"))
              : tab.kind === "site"
                ? (site ? siteHost(site) : ts("editor"))
                : ts("preview");
          return (
            <div
              key={tab.kind === "code" ? `code-${tab.fileId}` : tab.kind === "site" ? `site-${tab.siteId}` : "preview"}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => setActive(group, i)}
              onDoubleClick={() => moveTabToOtherSide(group, i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(group, i);
                } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const n = (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
                  setActive(group, n);
                }
              }}
              title={ts("moveSide", { name: tabName })}
              className="flex shrink-0 cursor-pointer items-center gap-2 border-r px-3 py-2 font-mono text-xs whitespace-nowrap"
              style={{
                background: isActive ? "var(--ide-tab-active)" : "transparent",
                borderColor: "var(--ide-border)",
                borderTop: isActive ? "1px solid var(--ide-accent)" : "1px solid transparent",
                color: isActive ? "var(--ide-fg-bright)" : "var(--ide-fg-dim)",
              }}
            >
              {tab.kind === "code" && file ? (
                <FileIcon file={file} size={14} />
              ) : (
                <Globe size={13} style={{ color: "var(--ide-accent)" }} />
              )}
              <span>{tabName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(group, i);
                }}
                title={tabs.length === 1 ? ts("closeEmpty") : ts("closeTab")}
                aria-label={tab.kind === "code" ? `${ts("closeTab")} ${file?.filename}` : tab.kind === "site" ? `${ts("closeTab")} ${tabName}` : ts("closePreview")}
                className="rounded p-0.5 opacity-60 hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
        <div className="flex flex-1 items-center justify-end gap-0.5 px-1.5">
          <button
            onClick={toggleSplit}
            title={ts("toggleSplitHint")}
            aria-label={ts("toggleSplitHint")}
            className="rounded p-1.5 max-lg:hidden"
            style={{ color: "var(--ide-fg-dim)" }}
          >
            <Columns2 size={14} />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div
        className="flex shrink-0 items-center gap-1 overflow-x-auto border-b px-3 py-1.5 font-mono text-[11px] whitespace-nowrap ide-scroll"
        style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)" }}
        aria-label={ts("crumb")}
      >
        <span>portfolio</span>
        <ChevronRight size={11} aria-hidden />
        {!active ? (
          <span style={{ color: "var(--ide-fg)" }}>{ts("welcome")}</span>
        ) : active.kind === "site" ? (
          <>
            <span>projects</span>
            <ChevronRight size={11} aria-hidden />
            <span style={{ color: "var(--ide-fg)" }}>{siteForId(active.siteId)?.label ?? active.siteId}</span>
          </>
        ) : active.kind === "code" && fileOf(active) ? (
          <>
            <span>{IDE_FOLDERS.find((g) => g.id === fileOf(active)?.folder)?.name ?? fileOf(active)?.folder}</span>
            <ChevronRight size={11} aria-hidden />
            <span className="flex items-center gap-1.5" style={{ color: "var(--ide-fg)" }}>
              {fileOf(active)?.filename}
              <span
                className="rounded-full border px-1.5 py-px text-[9px] tracking-wide uppercase"
                style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)" }}
              >
                {KIND_LANGUAGE[fileOf(active)!.kind]}
              </span>
            </span>
          </>
        ) : (
          <>
            <span>{routeFile.filename}</span>
            <ChevronRight size={11} aria-hidden />
            <span style={{ color: "var(--ide-fg)" }}>{ts("preview")}</span>
          </>
        )}
        {active?.kind === "code" && <CodeMeta fileId={active.fileId} />}
      </div>

      {/* Content */}
      {active?.kind === "preview" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <BrowserBar />
          <div className="ide-scroll min-h-0 flex-1 overflow-auto p-4 max-lg:overflow-visible lg:p-6">
            {preview}
          </div>
        </div>
      ) : active?.kind === "site" ? (
        <SiteBrowser key={active.siteId} siteId={active.siteId} />
      ) : active && active.kind === "code" ? (
        <CodeTabContent fileId={active.fileId} />
      ) : (
        <WelcomeView />
      )}
    </section>
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchLines(code: string, query: string): number[] {
  if (!query || !code) return [];
  const re = new RegExp(escapeRegExp(query), "gi");
  const lines: number[] = [];
  code.split("\n").forEach((text, i) => {
    re.lastIndex = 0;
    if (re.test(text)) lines.push(i + 1);
  });
  return lines;
}

// Floating find widget (Ctrl+F): searches the active code tab of the
// last-active group, jumps across shiki `.line` spans. Client-only.
function FindWidget({ rootRef }: { rootRef: React.RefObject<HTMLDivElement | null> }) {
  const { state, lastActive } = useEditors();
  const locale = useLocale();
  const ts = useTranslations("ide.split");
  const liveTheme = useLiveTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, bump] = useReducer((x: number) => x + 1, 0);

  useEffect(() => subscribeSource(bump), []);

  useEffect(() => {
    const h = () => {
      setQuery("");
      setShown(0);
      setOpen(true);
    };
    window.addEventListener("porto-find", h);
    return () => window.removeEventListener("porto-find", h);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [open ]);

  const group: GroupId = state.right && lastActive === "right" ? "right" : "left";
  const tabs = group === "left" ? state.left : (state.right ?? state.left);
  const activeTab = tabs[group === "left" ? state.activeLeft : state.activeRight];
  const fileId = activeTab?.kind === "code" ? activeTab.fileId : null;
  const tag = fileId === "settings" ? liveTheme : "";
  const code = fileId ? (readSource(sourceKey(locale, fileId, tag))?.code ?? "") : "";

  const matches = useMemo(() => matchLines(code, query), [code, query]);
  const current = matches.length === 0 ? 0 : Math.min(Math.max(shown, 1), matches.length);

  function clearMarks() {
    rootRef.current
      ?.querySelectorAll(".codepane .line.find-hit, .codepane .line.find-current")
      .forEach((el) => el.classList.remove("find-hit", "find-current"));
  }

  function paint(lineIdx: number, lines: number[]) {
    if (!fileId || lines.length === 0) return;
    const line = lines[lineIdx];
    clearMarks();
    const pane = rootRef.current?.querySelector(`[data-codepane="${CSS.escape(fileId)}"]`);
    const el = pane?.querySelector(`.line:nth-child(${line})`);
    pane?.querySelectorAll(".line").forEach((l, i) => {
      if (lines.includes(i + 1)) l.classList.add("find-hit");
    });
    el?.classList.add("find-current");
    el?.scrollIntoView({ block: "center" });
  }

  function go(n: number) {
    if (matches.length === 0) return;
    const w = ((n % matches.length) + matches.length) % matches.length;
    setShown(w + 1);
    paint(w, matches);
  }

  useEffect(() => {
    if (open && query && matches.length > 0) paint(0, matches);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, code]);

  if (!open || !fileId) return null;

  return (
    <div
      role="search"
      aria-label={ts("findInFile")}
      className="absolute top-2 right-2 z-20 flex items-center gap-1 rounded-md border px-2 py-1.5 shadow-xl"
      style={{ background: "var(--ide-explorer)", borderColor: "var(--ide-border)" }}
    >
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShown(e.target.value ? 1 : 0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            go(e.shiftKey ? current - 2 : current);
          } else if (e.key === "Escape") {
            clearMarks();
            setOpen(false);
          }
        }}
        placeholder={ts("find")}
        aria-label={ts("findInFile")}
        spellCheck={false}
        autoComplete="off"
        className="w-36 bg-transparent font-mono text-xs outline-none placeholder:opacity-50"
        style={{ color: "var(--ide-fg-bright)" }}
      />
      <span className="font-mono text-[10px]" style={{ color: "var(--ide-fg-dim)" }}>
        {query ? `${current}/${matches.length}` : ""}
      </span>
      <button
        onClick={() => go(current - 2)}
        aria-label={ts("prevMatch")}
        className="rounded p-0.5"
        style={{ color: "var(--ide-fg-dim)" }}
      >
        <ChevronUp size={13} />
      </button>
      <button
        onClick={() => go(current)}
        aria-label={ts("nextMatch")}
        className="rounded p-0.5"
        style={{ color: "var(--ide-fg-dim)" }}
      >
        <ChevronDown size={13} />
      </button>
      <button
        onClick={() => {
          clearMarks();
          setOpen(false);
        }}
        aria-label={ts("closeFind")}
        className="rounded p-0.5"
        style={{ color: "var(--ide-fg-dim)" }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Split root: groups + sash + mobile group switcher.
// ---------------------------------------------------------------------------
export function SplitView({ preview }: { preview: React.ReactNode }) {
  const { state, lastActive, setRatio } = useEditors();
  const ts = useTranslations("ide.split");
  const [mobileGroup, setMobileGroup] = useState<GroupId>("right");
  const rootRef = useRef<HTMLDivElement>(null);
  // Collapse to the single group automatically — no effect needed.
  const visible: GroupId = state.right ? mobileGroup : "left";
  // Site focus: a live site takes the full editor width (both grids).
  const focus = focusedSiteGroup(state, lastActive);

  const leftTab = state.left[state.activeLeft];
  const tabLabel = (t: (typeof state.left)[number] | undefined): string => {
    if (!t) return ts("welcome");
    if (t.kind === "code") return IDE_FILES.find((f) => f.id === t.fileId)?.filename ?? ts("editor");
    if (t.kind === "site") {
      const s = siteForId(t.siteId);
      return s ? siteHost(s) : ts("editor");
    }
    return ts("preview");
  };
  const leftName = tabLabel(leftTab);
  const rightTab = state.right?.[state.activeRight];
  const rightName = !state.right ? null : tabLabel(rightTab);

  return (
    <div ref={rootRef} className="relative flex min-h-0 flex-1 flex-col">
      <FindWidget rootRef={rootRef} />
      {focus ? (
        // Site focus: single group at full width (mobile + desktop).
        <div className="flex min-h-0 flex-1">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <GroupView group={focus} preview={preview} mobileVisible />
          </div>
        </div>
      ) : (
        <>
          {state.right && (
            <div
              role="tablist"
              aria-label={ts("editorGroup")}
              className="mb-3 flex shrink-0 gap-1 self-start rounded-lg border p-1 lg:hidden"
              style={{ borderColor: "var(--ide-border)", background: "var(--ide-terminal)" }}
            >
              {(
                [
                  { id: "left", label: leftName, Icon: Code2 },
                  { id: "right", label: rightName ?? ts("preview"), Icon: Eye },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={mobileGroup === id}
                  onClick={() => setMobileGroup(id)}
                  className="flex max-w-36 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
                  style={{
                    background: mobileGroup === id ? "var(--ide-explorer-hover)" : "transparent",
                    color: mobileGroup === id ? "var(--ide-fg-bright)" : "var(--ide-fg-dim)",
                  }}
                >
                  <Icon size={13} />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex min-h-0 flex-1 max-lg:block lg:flex-row">
            <div
              className={`min-h-0 min-w-0 flex-col ${visible === "left" ? "flex" : "hidden"} lg:flex`}
              style={{ width: state.right ? undefined : "100%", flex: state.right ? `0 0 ${state.ratio}%` : "1 1 auto" }}
            >
              <GroupView group="left" preview={preview} mobileVisible={visible === "left"} />
            </div>
            {state.right && (
              <>
                <Sash ratio={state.ratio} onRatio={setRatio} />
                <div
                  className={`min-h-0 min-w-0 flex-1 flex-col ${visible === "right" ? "flex" : "hidden"} lg:flex`}
                >
                  <GroupView group="right" preview={preview} mobileVisible={visible === "right"} />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

