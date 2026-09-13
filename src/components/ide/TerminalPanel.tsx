"use client";

import { useEffect, useRef, useState } from "react";
import { IDE_FILES } from "@/lib/files";
import { THEME_IDS } from "@/lib/themes";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

interface Line {
  type: "in" | "out" | "err";
  text: string;
}

const HELP = (es: boolean) => [
  es ? "Comandos disponibles:" : "Available commands:",
  "  help / ayuda",
  "  ls · pwd · whoami · date",
  "  open <archivo> [--side] — ej: open projects.js --side",
  "  go <ruta>       — ej: go /skills",
  "  about · skills · projects · contact · socials",
  "  split     - Toggle code/preview split editor",
  "  themes · theme <id> · lang <es|en> · cv · clear",
];

export function TerminalPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const locale = useLocale();
  const es = locale === "es";
  const [lines, setLines] = useState<Line[]>([
    { type: "out", text: es ? "Terminal interactiva — escribe “help”." : "Interactive terminal — type “help”." },
  ]);
  const [value, setValue] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  function print(extra: Line[]) {
    setLines((p) => [...p, ...extra]);
  }

  function run(raw: string) {
    const cmd = raw.trim();
    if (!cmd) return;
    if (cmd === "clear") {
      setLines([]);
      return;
    }
    const out: Line[] = [{ type: "in", text: `$ ${cmd}` }];
    const [name, ...args] = cmd.split(/\s+/);
    const c = name.toLowerCase();

    const go = (route: string) => {
      // next-intl router localizes automatically — never pre-prefix.
      router.push(route as "/");
      out.push({ type: "out", text: `→ ${route}` });
    };

    if (c === "help" || c === "ayuda") out.push(...HELP(es).map((text) => ({ type: "out" as const, text })));
    else if (c === "ls") out.push({ type: "out", text: IDE_FILES.map((f) => f.filename).join("  ") });
    else if (c === "pwd") out.push({ type: "out", text: "/home/pochonski/portfolio" });
    else if (c === "whoami") out.push({ type: "out", text: es ? "visitante — explorando el portfolio de Joseph" : "visitor — exploring Joseph's portfolio" });
    else if (c === "date") out.push({ type: "out", text: new Date().toString() });
    else if (c === "about" || c === "socials" || c === "contact")
      out.push(
        { type: "out", text: "Joseph Fonseca — Costa Rica · Remoto" },
        { type: "out", text: "GitHub: github.com/Pochonski" },
        { type: "out", text: "LinkedIn: linkedin.com/in/joseph-fonseca-n" },
        { type: "out", text: "Email: joseph19102005@gmail.com" }
      );
    else if (c === "skills")
      out.push({ type: "out", text: "React · Next.js · TypeScript · Tailwind · Supabase/PostgreSQL · Python · Azure · Git/Vercel" });
    else if (c === "projects") go("/projects");
    else if (c === "split") {
      window.dispatchEvent(new CustomEvent("porto-split"));
      out.push({ type: "out", text: es ? "Split editor alternado." : "Split editor toggled." });
    }
    else if (c === "cv") {
      window.open("/cv/Joseph-Fonseca-CV.pdf", "_blank", "noopener");
      out.push({ type: "out", text: "CV → /cv/Joseph-Fonseca-CV.pdf" });
    } else if (c === "themes") out.push({ type: "out", text: THEME_IDS.join("  ") });
    else if (c === "theme") {
      const id = args[0];
      if (id && THEME_IDS.includes(id)) {
        document.documentElement.setAttribute("data-theme", id);
        try {
          localStorage.setItem("porto-ide-theme", id);
        } catch {}
        window.dispatchEvent(new CustomEvent("porto-theme", { detail: id }));
        out.push({ type: "out", text: `Theme → ${id}` });
      } else out.push({ type: "err", text: es ? "Uso: theme <id>. Prueba “themes”." : "Usage: theme <id>. Try “themes”." });
    } else if (c === "lang") {
      const l = args[0];
      if (l === "es" || l === "en") {
        const clean = window.location.pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/";
        window.location.href = l === "es" ? clean : `/${l}${clean === "/" ? "" : clean}`;
      } else out.push({ type: "err", text: "Uso: lang <es|en>" });
    } else if (c === "open") {
      const toSide = args.includes("--side");
      const target = args.find((a) => a !== "--side");
      const f = IDE_FILES.find((x) => x.filename === target || x.id === target);
      if (f) {
        if (toSide) {
          window.dispatchEvent(
            new CustomEvent("porto-open-file", { detail: { fileId: f.id, toSide: true } })
          );
          out.push({ type: "out", text: `→ ${f.filename} (to the side)` });
        } else go(f.route);
      } else out.push({ type: "err", text: es ? `Archivo desconocido: ${target || ""}` : `Unknown file: ${target || ""}` });
    } else if (c === "go") {
      const f = IDE_FILES.find((x) => x.route === args[0] || x.id === args[0]);
      if (f) go(f.route);
      else out.push({ type: "err", text: es ? `Ruta desconocida: ${args[0] || ""}` : `Unknown route: ${args[0] || ""}` });
    } else if (c === "echo") out.push({ type: "out", text: args.join(" ") });
    else out.push({ type: "err", text: es ? `No encontrado: ${c}. Prueba “help”.` : `Not found: ${c}. Try “help”.` });

    print(out);
  }

  return (
    <section
      aria-label="Terminal"
      className="flex h-56 shrink-0 flex-col border-t"
      style={{ background: "var(--ide-terminal)", borderColor: "var(--ide-border)" }}
    >
      <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-mono" style={{ color: "var(--ide-fg-dim)" }}>
        <span>TERMINAL — zsh</span>
        <button onClick={onClose} aria-label="Close terminal" className="px-2 py-0.5 hover:opacity-100">
          ✕
        </button>
      </div>
      <div ref={bodyRef} role="log" aria-live="polite" onClick={() => inputRef.current?.focus()} className="flex-1 cursor-text overflow-y-auto px-3 pb-2 font-mono text-[12.5px] leading-5 ide-scroll">
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              color: l.type === "err" ? "var(--ide-error)" : l.type === "in" ? "var(--ide-fg-bright)" : "var(--ide-fg)",
              whiteSpace: "pre-wrap",
            }}
          >
            {l.text}
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = value;
            setValue("");
            setHist((h) => (v.trim() ? [...h, v.trim()] : h));
            setHi(-1);
            run(v);
          }}
          className="flex items-center gap-2"
        >
          <span style={{ color: "var(--ide-accent)" }}>$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                if (hist.length) {
                  const n = hi < hist.length - 1 ? hi + 1 : hi;
                  setHi(n);
                  setValue(hist[hist.length - 1 - n] ?? "");
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (hi > 0) {
                  const n = hi - 1;
                  setHi(n);
                  setValue(hist[hist.length - 1 - n] ?? "");
                } else if (hi === 0) {
                  setHi(-1);
                  setValue("");
                }
              }
            }}
            className="w-full bg-transparent outline-none"
            style={{ color: "var(--ide-fg-bright)" }}
            autoComplete="off"
            spellCheck={false}
            aria-label="Terminal input"
          />
        </form>
      </div>
    </section>
  );
}
