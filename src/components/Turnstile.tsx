"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export function Turnstile({
  onToken,
  theme = "auto",
}: {
  onToken: (token: string | undefined) => void;
  theme?: "light" | "dark" | "auto";
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);
  const tokenRef = useRef(onToken);

  useEffect(() => {
    tokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey) return;
    let widgetId: string | undefined;
    let cancelled = false;

    function render() {
      if (cancelled || !ref.current || !window.turnstile || widgetId) return;
      widgetId = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme,
        callback: (token: string) => tokenRef.current(token),
        "expired-callback": () => tokenRef.current(undefined),
        "error-callback": () => tokenRef.current(undefined),
      });
    }

    if (window.turnstile) {
      render();
      return () => {
        cancelled = true;
      };
    }

    const script = document.querySelector<HTMLScriptElement>('script[src*="challenges.cloudflare.com/turnstile"]');
    const prevOnLoad = window.onTurnstileLoad;
    window.onTurnstileLoad = () => {
      prevOnLoad?.();
      render();
    };
    if (!script) {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    } else if (script.dataset.loaded === "1") {
      render();
    } else {
      script.addEventListener("load", render, { once: true });
    }
    const activeScript = document.querySelector<HTMLScriptElement>('script[src*="challenges.cloudflare.com/turnstile"]');
    const markLoaded = () => {
      if (activeScript) activeScript.dataset.loaded = "1";
    };
    activeScript?.addEventListener("load", markLoaded, { once: true });

    return () => {
      cancelled = true;
      window.onTurnstileLoad = prevOnLoad;
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.reset(widgetId);
        } catch {
          // ignore reset errors on unmount
        }
      }
    };
  }, [siteKey, theme]);

  if (!siteKey) return null;
  return <div ref={ref} aria-label="Captcha verification" />;
}
