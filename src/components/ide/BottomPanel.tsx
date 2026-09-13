"use client";

import { useEffect, useReducer, useRef } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronsUpDown,
  ScrollText,
  SquareTerminal,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { TerminalPanel } from "./TerminalPanel";
import { useTranslations } from "next-intl";
import {
  clearOutput,
  getOutputEntries,
  subscribeOutput,
} from "@/lib/output-log";
import {
  clearTermLines,
  getTermLines,
  subscribeTerminal,
} from "@/lib/terminal-store";

export type PanelTab = "problems" | "output" | "terminal";

const DEFAULT_VH = 28;
const MAX_VH = 62;

function ProblemsView() {
  const t = useTranslations("ide.panel");
  const [, bump] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribeTerminal(bump), []);
  const errors = getTermLines().filter((l) => l.type === "err");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [errors.length]);

  if (errors.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 font-mono text-xs" style={{ color: "var(--ide-fg-dim)" }}>
        <CheckCircle2 size={14} style={{ color: "var(--ide-success)" }} />
        {t("noProblems")}
      </div>
    );
  }
  return (
    <div ref={ref} role="log" aria-label={t("problems")} className="ide-scroll min-h-0 flex-1 overflow-auto px-3 py-2">
      {errors.map((l, i) => (
        <div key={i} className="flex items-start gap-2 py-0.5 font-mono text-[12.5px] leading-5">
          <XCircle size={14} className="mt-0.5 shrink-0" style={{ color: "var(--ide-error)" }} />
          <span style={{ color: "var(--ide-fg)", whiteSpace: "pre-wrap" }}>{l.text}</span>
        </div>
      ))}
    </div>
  );
}

function OutputView() {
  const t = useTranslations("ide.panel");
  const [, bump] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribeOutput(bump), []);
  const entries = getOutputEntries();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries.length]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 font-mono text-xs" style={{ color: "var(--ide-fg-dim)" }}>
        <ScrollText size={14} />
        {t("outputIdle")}
      </div>
    );
  }
  return (
    <div ref={ref} role="log" aria-label={t("output")} className="ide-scroll min-h-0 flex-1 overflow-auto px-3 py-2">
      {entries.map((e, i) => (
        <div key={i} className="py-px font-mono text-[12.5px] leading-5">
          <span style={{ color: "var(--ide-fg-dim)" }}>
            [{new Date(e.time).toLocaleTimeString()}]{" "}
          </span>
          <span style={{ color: "var(--ide-fg)" }}>{e.message}</span>
        </div>
      ))}
    </div>
  );
}

// Bottom panel with VS Code tabs: Problems / Output / Terminal.
// Replaces the old single terminal: session survives tab switches.
export function BottomPanel({
  tab,
  onTab,
  onClose,
  heightVh,
  onHeight,
  maximized,
  onToggleMax,
}: {
  tab: PanelTab;
  onTab: (t: PanelTab) => void;
  onClose: () => void;
  heightVh: number | null;
  onHeight: (vh: number) => void;
  maximized: boolean;
  onToggleMax: () => void;
}) {
  const t = useTranslations("ide.panel");
  const [, bump] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribeTerminal(bump), []);
  const problemCount = getTermLines().filter((l) => l.type === "err").length;

  const drag = useRef(false);
  const startDrag = (e: React.PointerEvent) => {
    drag.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDrag = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const vh = ((window.innerHeight - e.clientY) / window.innerHeight) * 100;
    onHeight(Math.min(70, Math.max(12, Math.round(vh))));
  };
  const endDrag = () => {
    drag.current = false;
  };

  const clearActive = () => {
    if (tab === "terminal" || tab === "problems") clearTermLines();
    else clearOutput();
  };

  const tabs: { id: PanelTab; label: string; Icon: typeof SquareTerminal; badge?: number }[] = [
    { id: "problems", label: t("problems"), Icon: AlertTriangle, badge: problemCount },
    { id: "output", label: t("output"), Icon: ScrollText },
    { id: "terminal", label: t("terminal"), Icon: SquareTerminal },
  ];

  return (
    <section
      aria-label={t("panel")}
      className="flex shrink-0 flex-col border-t"
      style={{
        background: "var(--ide-terminal)",
        borderColor: "var(--ide-border)",
        height: maximized ? `${MAX_VH}vh` : heightVh ? `${heightVh}vh` : `${DEFAULT_VH}vh`,
      }}
    >
      {/* Resize handle */}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label={t("resize")}
        tabIndex={0}
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={onToggleMax}
        onKeyDown={(e) => {
          const cur = maximized ? MAX_VH : (heightVh ?? DEFAULT_VH);
          if (e.key === "ArrowUp") onHeight(Math.min(70, cur + 2));
          else if (e.key === "ArrowDown") onHeight(Math.max(12, cur - 2));
        }}
        className="-mb-1 z-10 flex h-[7px] cursor-row-resize items-center justify-center outline-none"
        title={t("resizeHint")}
      >
        <div className="h-px w-full" style={{ background: "var(--ide-border)" }} />
      </div>

      {/* Tab bar */}
      <div className="flex shrink-0 items-center justify-between border-b" style={{ borderColor: "var(--ide-border)" }}>
        <div role="tablist" aria-label={t("panelTabs")} className="flex items-stretch">
          {tabs.map(({ id, label, Icon, badge }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active}
                onClick={() => onTab(id)}
                className="flex items-center gap-1.5 px-3 py-2 font-mono text-[11px] tracking-wide uppercase"
                style={{
                  color: active ? "var(--ide-fg-bright)" : "var(--ide-fg-dim)",
                  borderBottom: active ? "1px solid var(--ide-accent)" : "1px solid transparent",
                }}
              >
                <Icon size={12} />
                {label}
                {typeof badge === "number" && badge > 0 && (
                  <span
                    className="rounded-full px-1.5 py-px text-[10px]"
                    style={{ background: "var(--ide-error)", color: "#fff" }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-0.5 px-2" style={{ color: "var(--ide-fg-dim)" }}>
          <button
            onClick={clearActive}
            title={t("clearItem", { tab: t(tab) })}
            aria-label={t("clearItem", { tab: t(tab) })}
            className="rounded p-1.5 hover:opacity-100"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={onToggleMax}
            title={maximized ? t("restore") : t("maximize")}
            aria-label={maximized ? t("restore") : t("maximize")}
            aria-pressed={maximized}
            className="rounded p-1.5 hover:opacity-100"
          >
            {maximized ? <ChevronDown size={14} /> : <ChevronsUpDown size={13} />}
          </button>
          <button
            onClick={onClose}
            title={t("closePanel")}
            aria-label={t("closePanel")}
            className="rounded p-1.5 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col">
        {tab === "problems" && <ProblemsView />}
        {tab === "output" && <OutputView />}
        {tab === "terminal" && <TerminalPanel onClose={onClose} bare />}
      </div>
    </section>
  );
}
