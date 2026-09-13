"use client";

import { useEffect, useRef } from "react";

// Miniature code overview with live viewport + click/drag scrub,
// VS Code minimap style. Desktop-only (hidden below xl by the parent).
export function Minimap({
  html,
  text,
  paneRef,
}: {
  html?: string;
  text?: string;
  paneRef: React.RefObject<HTMLDivElement | null>;
}) {
  const miniRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const view = viewRef.current;
        const mini = miniRef.current;
        if (!view || !mini) return;
        const { scrollTop, scrollHeight, clientHeight } = pane;
        const mh = mini.clientHeight;
        if (scrollHeight <= clientHeight + 1 || mh === 0) {
          view.style.display = "none";
          return;
        }
        view.style.display = "block";
        const h = Math.max(24, (clientHeight / scrollHeight) * mh);
        const maxTop = mh - h;
        const top =
          maxTop <= 0
            ? 0
            : Math.min(maxTop, (scrollTop / (scrollHeight - clientHeight)) * maxTop);
        view.style.height = `${h}px`;
        view.style.transform = `translateY(${top}px)`;
      });
    };
    update();
    pane.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      pane.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [paneRef, html, text]);

  const jump = (clientY: number) => {
    const pane = paneRef.current;
    const mini = miniRef.current;
    if (!pane || !mini) return;
    const rect = mini.getBoundingClientRect();
    if (rect.height === 0) return;
    const ratio = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    pane.scrollTop = ratio * (pane.scrollHeight - pane.clientHeight);
  };

  return (
    <div
      aria-hidden
      onPointerDown={(e) => {
        jump(e.clientY);
        const move = (ev: PointerEvent) => jump(ev.clientY);
        const up = () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      }}
      className="relative hidden w-20 shrink-0 cursor-pointer overflow-hidden border-l select-none xl:block"
      style={{ borderColor: "var(--ide-border)", background: "var(--ide-bg)" }}
    >
      <div ref={miniRef} className="minimap-body absolute inset-0 overflow-hidden px-1 py-4 font-mono">
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre>{text ?? ""}</pre>
        )}
      </div>
      <div
        ref={viewRef}
        className="absolute inset-x-0 top-0 rounded-sm"
        style={{
          background: "rgba(var(--ide-accent-rgb), 0.16)",
          boxShadow: "inset 0 0 0 1px rgba(var(--ide-accent-rgb), 0.45)",
        }}
      />
    </div>
  );
}
