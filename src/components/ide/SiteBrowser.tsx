"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  Globe,
  Lock,
  Minimize,
  Maximize,
  RotateCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { siteForId } from "@/lib/files";
import { focusedSiteGroup, useEditors } from "./editors-context";

interface PortoRouteMessage {
  source?: unknown;
  href?: unknown;
}

function siteOriginOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

// Last known URL per site: returning to a tab remounts the browser
// (key={siteId}), so resume the subroute instead of the home page.
const lastUrlBySite = new Map<string, string>();

export function SiteBrowser({ siteId }: { siteId: string }) {
  const site = siteForId(siteId);
  const ts = useTranslations("ide.split");
  const tt = useTranslations("ide.site");
  const { state, lastActive, showPreview, setRatio } = useEditors();
  const [reloadKey, setReloadKey] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(() => lastUrlBySite.get(siteId) ?? site?.url ?? "");
  const [draftUrl, setDraftUrl] = useState(() => lastUrlBySite.get(siteId) ?? site?.url ?? "");
  const [iframeSrc, setIframeSrc] = useState(() => lastUrlBySite.get(siteId) ?? site?.url ?? "");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const siteOrigin = useMemo(() => (site ? siteOriginOf(site.url) : null), [site]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as PortoRouteMessage | null;
      if (!data || data.source !== "porto-site-route" || typeof data.href !== "string") {
        return;
      }
      if (!siteOrigin || event.origin !== siteOrigin) return;
      let href: string;
      try {
        href = new URL(data.href).href;
      } catch {
        return;
      }
      if (!href.startsWith(siteOrigin)) return;
      lastUrlBySite.set(siteId, href);
      setCurrentUrl(href);
      if (document.activeElement !== inputRef.current) {
        setDraftUrl(href);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [siteOrigin, siteId]);

  useEffect(() => {
    if (loadTimer.current) clearTimeout(loadTimer.current);
    loadTimer.current = setTimeout(() => {
      setLoaded((done) => {
        if (!done) setFailed(true);
        return done;
      });
    }, 12000);
    return () => {
      if (loadTimer.current) clearTimeout(loadTimer.current);
    };
  }, [reloadKey, siteId]);

  const reload = useCallback(() => {
    setCurrentUrl((cur) => {
      setIframeSrc(cur);
      return cur;
    });
    setReloadKey((k) => k + 1);
    setLoaded(false);
    setFailed(false);
    setSpinning(true);
    setTimeout(() => setSpinning(false), 700);
  }, []);

  const goHistory = useCallback((delta: -1 | 1) => {
    try {
      const hist = iframeRef.current?.contentWindow?.history;
      if (!hist) return;
      if (delta === -1) hist.back();
      else hist.forward();
    } catch {
      /* cross-origin history traversal is best-effort */
    }
  }, []);

  const commitAddress = useCallback(() => {
    if (!siteOrigin) return;
    const raw = draftUrl.trim();
    if (!raw) {
      setDraftUrl(currentUrl);
      inputRef.current?.blur();
      return;
    }
    let dest: URL;
    try {
      // Accepts full URLs and same-site paths ("/categoria/x").
      dest = new URL(raw, siteOrigin);
    } catch {
      setDraftUrl(currentUrl);
      inputRef.current?.blur();
      return;
    }
    if (dest.origin !== siteOrigin) {
      // Foreign origin: refuse to drive the iframe there, revert.
      setDraftUrl(currentUrl);
      inputRef.current?.blur();
      return;
    }
    const href = dest.href;
    lastUrlBySite.set(siteId, href);
    setCurrentUrl(href);
    setDraftUrl(href);
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { source: "porto-site-navigate", href },
        siteOrigin
      );
    } catch {
      /* iframe not ready */
    }
    inputRef.current?.blur();
  }, [draftUrl, currentUrl, siteOrigin, siteId]);

  if (!site) return null;

  const focused = focusedSiteGroup(state, lastActive);
  const expanded = state.ratio <= 28;
  const toggleExpand = () => setRatio(expanded ? 50 : 25);

  // In focus, the toggle becomes "Show code" â†’ back to the portfolio
  // preview in the single browser slot (which also exits focus).
  const showCode = () => {
    showPreview();
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
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
        <button onClick={() => goHistory(-1)} title={ts("back")} aria-label={ts("goBack")} className={btn}>
          <ChevronLeft size={15} />
        </button>
        <button onClick={() => goHistory(1)} title={ts("forward")} aria-label={ts("goForward")} className={btn}>
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
        <form
          className="flex min-w-0 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            commitAddress();
          }}
        >
          <div
            className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px]"
            style={{ borderColor: "var(--ide-border)", background: "var(--ide-bg)" }}
          >
            {copied ? (
              <Check size={11} style={{ color: "var(--ide-success)" }} />
            ) : (
              <Lock size={11} style={{ color: "var(--ide-success)" }} />
            )}
            <Globe size={11} className="shrink-0" style={{ color: "var(--ide-accent)" }} />
            <input
              ref={inputRef}
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={() => setDraftUrl(currentUrl)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDraftUrl(currentUrl);
                  inputRef.current?.blur();
                }
              }}
              aria-label={tt("addressLabel")}
              spellCheck={false}
              autoComplete="off"
              className="min-w-0 flex-1 truncate bg-transparent outline-none"
              style={{ color: "var(--ide-fg)" }}
            />
            <span
              className="ml-1 hidden shrink-0 rounded-full border px-1.5 py-px text-[9px] tracking-wide uppercase sm:inline"
              style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)" }}
            >
              {tt("live")}
            </span>
          </div>
        </form>
        <button
          onClick={copyUrl}
          title={copied ? ts("copied") : ts("copyUrl")}
          aria-label={ts("copyPageUrl")}
          className={btn}
          style={copied ? { color: "var(--ide-success)" } : undefined}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
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
          onClick={() => window.open(currentUrl, "_blank", "noopener")}
          title={ts("openBrowser")}
          aria-label={ts("openBrowser")}
          className={btn}
        >
          <ExternalLink size={13} />
        </button>
      </div>

      {/* Live page */}
      <div className="relative min-h-0 flex-1 bg-white">
        {failed ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
            style={{ background: "var(--ide-editor)" }}
            role="alert"
          >
<Globe size={28} className="animate-pulse" style={{ color: "var(--ide-accent)" }} />
            <p className="font-mono text-xs" style={{ color: "var(--ide-fg)" }}>
              {ts("failedLoad")}
            </p>
            <p className="max-w-sm font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
              {currentUrl}
            </p>
            <div className="flex gap-2">
              <button
                onClick={reload}
                className="rounded-md border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: "var(--ide-accent)",
                  color: "var(--ide-accent)",
                  background: "rgba(var(--ide-accent-rgb), 0.07)",
                }}
              >
                {ts("reload")}
              </button>
              <button
                onClick={() => window.open(site.url, "_blank", "noopener")}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  background: "var(--ide-button)",
                  color: "var(--ide-button-fg)",
                }}
              >
                <ExternalLink size={12} /> {ts("openBrowser")}
              </button>
            </div>
          </div>
        ) : (
          <>
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
              ref={iframeRef}
              key={`${siteId}-${reloadKey}`}
              src={iframeSrc}
              title={site.label}
              onLoad={() => {
                setLoaded(true);
                setFailed(false);
                if (loadTimer.current) clearTimeout(loadTimer.current);
              }}
              onError={() => setFailed(true)}
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              className="absolute inset-0 h-full w-full border-0"
            />
          </>
        )}
      </div>
    </div>
  );
}
