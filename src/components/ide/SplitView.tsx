"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Columns2,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Lock,
  RotateCw,
  X,
} from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { IDE_FILES, fileForRoute } from "@/lib/files";
import { FileIcon } from "./FileIcon";
import {
  useEditors,
  useLiveTheme,
  type EditorTab,
  type GroupId,
} from "./editors-context";
import {
  fetchSource,
  readSource,
  sourceKey,
  subscribeSource,
} from "@/lib/source-cache";

const SITE_URL = "https://joseph-fonseca-vscode.vercel.app";

function fileOf(tab: EditorTab) {
  return tab.kind === "code" ? IDE_FILES.find((f) => f.id === tab.fileId) : undefined;
}

// ---------------------------------------------------------------------------
// Code tab content: cached highlighted HTML, fetched on demand (SWR-lite).
// ---------------------------------------------------------------------------
function CodeTabContent({ fileId }: { fileId: string }) {
  const locale = useLocale();
  const liveTheme = useLiveTheme();
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

  if (entry?.codeHtml) {
    return (
      <div
        className="codepane ide-scroll min-h-0 flex-1 overflow-auto p-4 font-mono text-[12.5px] leading-6 max-lg:overflow-visible"
        dangerouslySetInnerHTML={{ __html: entry.codeHtml }}
      />
    );
  }
  if (entry?.code) {
    return (
      <div className="ide-scroll min-h-0 flex-1 overflow-auto p-4 max-lg:overflow-visible">
        <pre className="font-mono text-[12.5px] leading-6" style={{ color: "var(--ide-fg)" }}>
          {entry.code}
        </pre>
      </div>
    );
  }
  if (failed) {
    return (
      <p className="p-4 font-mono text-xs" style={{ color: "var(--ide-error)" }}>
        Failed to load source.
      </p>
    );
  }
  return (
    <div className="flex flex-1 flex-col gap-2 p-4" aria-label="Loading source">
      {[90, 70, 80, 55, 75].map((w, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded"
          style={{ width: `${w}%`, background: "var(--ide-border)" }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple Browser toolbar: real back/forward/reload, address bar, open out.
// ---------------------------------------------------------------------------
function BrowserBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}${pathname}`;

  const reload = useCallback(() => {
    router.refresh();
    setSpinning(true);
    setTimeout(() => setSpinning(false), 700);
  }, [router]);

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  }, [url]);

  const btn =
    "rounded p-1.5 transition-opacity hover:opacity-100 disabled:opacity-30";
  return (
    <div
      className="flex shrink-0 items-center gap-1 border-b px-2 py-1.5"
      style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)" }}
    >
      <button onClick={() => router.back()} title="Back" aria-label="Go back" className={btn}>
        <ChevronLeft size={15} />
      </button>
      <button onClick={() => router.forward()} title="Forward" aria-label="Go forward" className={btn}>
        <ChevronRight size={15} />
      </button>
      <button
        onClick={reload}
        title="Reload"
        aria-label="Reload preview"
        className={btn}
        style={{ color: spinning ? "var(--ide-accent)" : undefined }}
      >
        <RotateCw size={13} className={spinning ? "animate-spin" : ""} />
      </button>
      <button
        onClick={copyUrl}
        title={copied ? "Copied!" : "Copy URL"}
        aria-label="Copy page URL"
        className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px]"
        style={{ borderColor: "var(--ide-border)", background: "var(--ide-bg)" }}
      >
        {copied ? (
          <Check size={11} style={{ color: "var(--ide-success)" }} />
        ) : (
          <Lock size={11} style={{ color: "var(--ide-success)" }} />
        )}
        <span className="truncate" style={{ color: "var(--ide-fg)" }}>
          {url}
        </span>
      </button>
      <button
        onClick={() => window.open(url, "_blank", "noopener")}
        title="Open in browser"
        aria-label="Open in browser"
        className={btn}
      >
        <ExternalLink size={13} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Draggable sash between groups (VS Code splitter).
// ---------------------------------------------------------------------------
function Sash({ ratio, onRatio }: { ratio: number; onRatio: (n: number) => void }) {
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
      aria-label="Resize editor groups"
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
      title="Drag to resize (double-click resets)"
    >
      <div
        className="w-px transition-colors"
        style={{ background: hot ? "var(--ide-accent)" : "var(--ide-border)" }}
      />
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
  const routeFile = fileForRoute(pathname);
  const tabs = group === "left" ? state.left : (state.right ?? []);
  const activeIdx = group === "left" ? state.activeLeft : state.activeRight;
  const active = tabs[Math.min(activeIdx, tabs.length - 1)];

  return (
    <section
      aria-label={group === "left" ? "Editor group 1" : "Editor group 2"}
      className={`min-h-0 min-w-0 flex-1 flex-col overflow-hidden max-lg:w-full ${
        mobileVisible ? "flex" : "hidden"
      } lg:flex`}
      style={{ background: "var(--ide-editor)" }}
    >
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label={group === "left" ? "Open files, group 1" : "Open files, group 2"}
        className="flex shrink-0 items-stretch overflow-x-auto ide-scroll"
        style={{ background: "var(--ide-tabs)" }}
      >
        {tabs.map((tab, i) => {
          const file = fileOf(tab);
          const isActive = i === Math.min(activeIdx, tabs.length - 1);
          const showX = tabs.length > 1 || group === "right";
          return (
            <div
              key={tab.kind === "code" ? `code-${tab.fileId}` : "preview"}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(group, i)}
              onDoubleClick={() => moveTabToOtherSide(group, i)}
              title={tab.kind === "code" ? `${file?.filename} — double-click moves to other side` : "Preview — double-click moves to other side"}
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
              <span>{tab.kind === "code" ? file?.filename : "Preview"}</span>
              {showX && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(group, i);
                  }}
                  title={group === "right" && tabs.length === 1 ? "Close group" : "Close"}
                  aria-label={tab.kind === "code" ? `Close ${file?.filename}` : "Close preview"}
                  className="rounded p-0.5 opacity-60 hover:opacity-100"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
        <div className="flex flex-1 items-center justify-end gap-0.5 px-1.5">
          <CopyButton group={group} />
          <button
            onClick={toggleSplit}
            title="Toggle split editor (Ctrl+\)"
            aria-label="Toggle split editor"
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
        aria-label="Breadcrumb"
      >
        <span>portfolio</span>
        <ChevronRight size={11} aria-hidden />
        {active && active.kind === "code" && fileOf(active) ? (
          <span style={{ color: "var(--ide-fg)" }}>{fileOf(active)?.filename}</span>
        ) : (
          <>
            <span>{routeFile.filename}</span>
            <ChevronRight size={11} aria-hidden />
            <span style={{ color: "var(--ide-fg)" }}>Preview</span>
          </>
        )}
      </div>

      {/* Content */}
      {active?.kind === "preview" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <BrowserBar />
          <div className="ide-scroll min-h-0 flex-1 overflow-auto p-4 max-lg:overflow-visible lg:p-6">
            {preview}
          </div>
        </div>
      ) : active ? (
        <CodeTabContent fileId={active.fileId} />
      ) : null}
    </section>
  );
}

function CopyButton({ group }: { group: GroupId }) {
  const { state } = useEditors();
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const tabs = group === "left" ? state.left : (state.right ?? []);
  const active = tabs[group === "left" ? state.activeLeft : state.activeRight];
  if (!active || active.kind !== "code") return null;
  return (
    <button
      onClick={async () => {
        const entry = readSource(sourceKey(locale, active.fileId));
        if (!entry?.code) return;
        try {
          await navigator.clipboard.writeText(entry.code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          /* clipboard unavailable */
        }
      }}
      title="Copy code"
      aria-label="Copy code"
      className="rounded p-1.5"
      style={{ color: "var(--ide-fg-dim)" }}
    >
      {copied ? <Check size={13} style={{ color: "var(--ide-success)" }} /> : <Copy size={13} />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Split root: groups + sash + mobile group switcher.
// ---------------------------------------------------------------------------
export function SplitView({ preview }: { preview: React.ReactNode }) {
  const { state, setRatio } = useEditors();
  const [mobileGroup, setMobileGroup] = useState<GroupId>("right");
  // Collapse to the single group automatically — no effect needed.
  const visible: GroupId = state.right ? mobileGroup : "left";

  const leftName =
    state.left[state.activeLeft]?.kind === "code"
      ? (IDE_FILES.find((f) => f.id === (state.left[state.activeLeft] as { fileId: string }).fileId)
          ?.filename ?? "Editor")
      : "Preview";
  const rightTab = state.right?.[state.activeRight];
  const rightName = !state.right
    ? null
    : rightTab?.kind === "code"
      ? (IDE_FILES.find((f) => f.id === rightTab.fileId)?.filename ?? "Editor")
      : "Preview";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {state.right && (
        <div
          role="tablist"
          aria-label="Editor group"
          className="mb-3 flex shrink-0 gap-1 self-start rounded-lg border p-1 lg:hidden"
          style={{ borderColor: "var(--ide-border)", background: "var(--ide-terminal)" }}
        >
          {(
            [
              { id: "left", label: leftName, Icon: Code2 },
              { id: "right", label: rightName ?? "Preview", Icon: Eye },
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
    </div>
  );
}

