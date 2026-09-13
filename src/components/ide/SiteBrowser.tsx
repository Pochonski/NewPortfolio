"use client";

import { useCallback, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  Globe,
  Lock,
  Minimize,
  Maximize,
  RotateCw,
} from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { fileForRoute, siteForId } from "@/lib/files";
import { focusedSiteGroup, useEditors } from "./editors-context";

// Integrated browser tab: toolbar (back/forward/reload/address/open-out/
// expand) + live <iframe> of the project's production URL.
export function SiteBrowser({ siteId }: { siteId: string }) {
  const site = siteForId(siteId);
  const router = useRouter();
  const pathname = usePathname();
  const ts = useTranslations("ide.split");
  const tt = useTranslations("ide.site");
  const { state, lastActive, openFile, setRatio } = useEditors();
  const [reloadKey, setReloadKey] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
    setLoaded(false);
    setSpinning(true);
    setTimeout(() => setSpinning(false), 700);
  }, []);

  if (!site) return null;

  const focused = focusedSiteGroup(state, lastActive);
  const expanded = state.ratio <= 28;
  const toggleExpand = () => setRatio(expanded ? 50 : 25);

  // In focus, the toggle becomes "Show code" → reopens the current route file
  // in the same group (which also exits focus). No-op if already a code tab.
  const showCode = () => {
    openFile(fileForRoute(pathname).id);
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(site.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  const btn =
    "rounded p-1.5 transition-opacity hover:opacity-100 disabled:opacity-30";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Browser toolbar */}
      <div
        className="flex shrink-0 items-center gap-1 border-b px-2 py-1.5"
        style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)" }}
      >
        <button onClick={() => router.back()} title={ts("back")} aria-label={ts("goBack")} className={btn}>
          <ChevronLeft size={15} />
        </button>
        <button onClick={() => router.forward()} title={ts("forward")} aria-label={ts("goForward")} className={btn}>
          <ChevronRight size={15} />
        </button>
        <button
          onClick={reload}
          title={ts("reload")}
          aria-label={ts("reload")}
          className={btn}
          style={{ color: spinning ? "var(--ide-accent)" : undefined }}
        >
          <RotateCw size={13} className={spinning ? "animate-spin" : ""} />
        </button>
        <button
          onClick={copyUrl}
          title={copied ? ts("copied") : ts("copyUrl")}
          aria-label={ts("copyPageUrl")}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px]"
          style={{ borderColor: "var(--ide-border)", background: "var(--ide-bg)" }}
        >
          {copied ? (
            <Check size={11} style={{ color: "var(--ide-success)" }} />
          ) : (
            <Lock size={11} style={{ color: "var(--ide-success)" }} />
          )}
          <Globe size={11} className="shrink-0" style={{ color: "var(--ide-accent)" }} />
          <span className="truncate" style={{ color: "var(--ide-fg)" }}>
            {site.url}
          </span>
          <span
            className="ml-1 hidden shrink-0 rounded-full border px-1.5 py-px text-[9px] tracking-wide uppercase sm:inline"
            style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)" }}
          >
            {tt("live")}
          </span>
        </button>
        {focused ? (
          <button
            onClick={showCode}
            title={tt("showCode")}
            aria-label={tt("showCode")}
            className={btn}
            style={{ color: "var(--ide-accent)" }}
          >
            <Code2 size={13} />
          </button>
        ) : (
          <button
            onClick={toggleExpand}
            title={expanded ? tt("collapse") : tt("expand")}
            aria-label={expanded ? tt("collapse") : tt("expand")}
            aria-pressed={expanded}
            className={btn}
          >
            {expanded ? <Minimize size={13} /> : <Maximize size={13} />}
          </button>
        )}
        <button
          onClick={() => window.open(site.url, "_blank", "noopener")}
          title={ts("openBrowser")}
          aria-label={ts("openBrowser")}
          className={btn}
        >
          <ExternalLink size={13} />
        </button>
      </div>

      {/* Live page */}
      <div className="relative min-h-0 flex-1 bg-white">
        {!loaded && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: "var(--ide-editor)" }}
            aria-label={ts("loadingSource")}
          >
            <Globe size={28} className="animate-pulse" style={{ color: "var(--ide-accent)" }} />
            <p className="font-mono text-xs" style={{ color: "var(--ide-fg-dim)" }}>
              {site.url}
            </p>
          </div>
        )}
        <iframe
          key={reloadKey}
          src={site.url}
          title={site.label}
          onLoad={() => setLoaded(true)}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  );
}
