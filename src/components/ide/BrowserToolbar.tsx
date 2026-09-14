"use client";

import { useCallback, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Lock,
  RotateCw,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const btn =
  "rounded-md p-1.5 transition-all hover:opacity-100 hover:bg-[rgba(var(--ide-accent-rgb),0.1)] disabled:opacity-30";

// Shared browser toolbar: back/forward/reload, pill address bar with status
// chip, optional trailing actions, open-out. Used by the portfolio preview
// (BrowserBar) and live sites (SiteBrowser).
export function BrowserToolbar({
  url,
  badge,
  onReload,
  spinning,
  extra,
  reloadLabel,
}: {
  url: string;
  badge: "live" | "200";
  onReload: () => void;
  spinning: boolean;
  extra?: React.ReactNode;
  reloadLabel?: string;
}) {
  const router = useRouter();
  const ts = useTranslations("ide.split");
  const tt = useTranslations("ide.site");
  const [copied, setCopied] = useState(false);

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  }, [url]);

  return (
    <div
      className="flex shrink-0 items-center gap-1 border-b px-2 py-1.5 backdrop-blur"
      style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)", background: "var(--ide-tabs)" }}
    >
      <button onClick={() => router.back()} title={ts("back")} aria-label={ts("goBack")} className={btn}>
        <ChevronLeft size={15} />
      </button>
      <button onClick={() => router.forward()} title={ts("forward")} aria-label={ts("goForward")} className={btn}>
        <ChevronRight size={15} />
      </button>
      <button
        onClick={onReload}
        title={ts("reload")}
        aria-label={reloadLabel ?? ts("reload")}
        className={btn}
        style={{ color: spinning ? "var(--ide-accent)" : undefined }}
      >
        <RotateCw size={13} className={spinning ? "animate-spin" : ""} />
      </button>
      <button
        onClick={copyUrl}
        title={copied ? ts("copied") : ts("copyUrl")}
        aria-label={ts("copyPageUrl")}
        className="browser-pill flex min-w-0 flex-1 items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px]"
        style={{ borderColor: "var(--ide-border)", background: "var(--ide-bg)" }}
      >
        {copied ? (
          <Check size={11} style={{ color: "var(--ide-success)" }} />
        ) : (
          <Lock size={11} style={{ color: "var(--ide-success)" }} />
        )}
        {badge === "live" && <Globe size={11} className="shrink-0" style={{ color: "var(--ide-accent)" }} />}
        <span className="truncate" style={{ color: "var(--ide-fg)" }}>
          {url}
        </span>
        <span
          className="hidden shrink-0 rounded-full border px-1.5 py-px text-[9px] tracking-wide uppercase sm:inline"
          style={
            badge === "live"
              ? { borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)" }
              : { borderColor: "rgba(var(--ide-accent-rgb), 0.4)", color: "var(--ide-accent)" }
          }
        >
          {badge === "live" ? tt("live") : "200"}
        </span>
      </button>
      {extra}
      <button
        onClick={() => window.open(url, "_blank", "noopener")}
        title={ts("openBrowser")}
        aria-label={ts("openBrowser")}
        className={btn}
      >
        <ExternalLink size={13} />
      </button>
    </div>
  );
}
