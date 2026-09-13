"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { IDE_FILES } from "@/lib/files";
import { THEME_IDS } from "@/lib/themes";
import { trackEvent } from "@/lib/analytics";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import {
  clearTermLines,
  getTermHistory,
  getTermLines,
  pushTermHistory,
  pushTermLines,
  subscribeTerminal,
  type TermLine,
} from "@/lib/terminal-store";

const HELP = (t: (key: string) => string) => [
  t("available"),
  "  help / ayuda",
  "  ls · pwd · whoami · date",
  `  ${t("openHelp")}`,
  `  ${t("goHelp")}`,
  "  about · skills · projects · contact · socials",
  "  neofetch · sudo · vim",
  `  ${t("splitHelp")}`,
  "  themes · theme <id> · lang <es|en> · cv · clear",
];

const COMMANDS = [
  "help",
  "ls",
  "pwd",
  "whoami",
  "date",
  "about",
  "socials",
  "contact",
  "skills",
  "projects",
  "split",
  "cv",
  "themes",
  "theme",
  "lang",
  "open",
  "go",
  "echo",
  "clear",
  "neofetch",
  "sudo",
  "vim",
  ":q!",
];

export function TerminalPanel({ onClose, bare }: { onClose: () => void; bare?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const tt = useTranslations("terminal");
  const clean = pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/";
  const prompt = `pochonski@portfolio:~${clean === "/" ? "" : clean}$`;

  const [, bump] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribeTerminal(bump), []);
  const lines = getTermLines();

  const [value, setValue] = useState("");
  const [hi, setHi] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Seed welcome once per session (persisted lines survive reloads).
  useEffect(() => {
    if (getTermLines().length === 0) {
      pushTermLines([
        { type: "out", text: tt("welcome") },
        { type: "out", text: "" },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  function print(extra: TermLine[]) {
    pushTermLines(extra);
  }

  function run(raw: string) {
    const cmd = raw.trim();
    if (!cmd) return;
    if (cmd === "clear") {
      clearTermLines();
      return;
    }
    const out: TermLine[] = [{ type: "in", text: `${prompt} ${cmd}` }];
    const [name, ...args] = cmd.split(/\s+/);
    const c = name.toLowerCase();
    trackEvent("terminal_command", { cmd: c });

    const go = (route: string) => {
      // next-intl router localizes automatically — never pre-prefix.
      router.push(route as "/");
      out.push({ type: "out", text: `→ ${route}` });
    };

    if (c === "help" || c === "ayuda") out.push(...HELP(tt).map((text) => ({ type: "out" as const, text })));
    else if (c === "ls") out.push({ type: "out", text: IDE_FILES.map((f) => f.filename).join("  ") });
    else if (c === "pwd") out.push({ type: "out", text: "/home/pochonski/portfolio" });
    else if (c === "whoami") out.push({ type: "out", text: tt("whoami") });
    else if (c === "date") out.push({ type: "out", text: new Date().toString() });
    else if (c === "about" || c === "socials" || c === "contact")
      out.push(
        { type: "out", text: tt("aboutLine") },
        { type: "out", text: "GitHub: github.com/Pochonski" },
        { type: "out", text: "LinkedIn: linkedin.com/in/joseph-fonseca-n" },
        { type: "out", text: "Email: joseph19102005@gmail.com" }
      );
    else if (c === "skills")
      out.push({ type: "out", text: "React · Next.js · TypeScript · Tailwind · Supabase/PostgreSQL · Python · Azure · Git/Vercel" });
    else if (c === "projects") go("/projects");
    else if (c === "split") {
      window.dispatchEvent(new CustomEvent("porto-split"));
      out.push({ type: "out", text: tt("splitToggled") });
    } else if (c === "cv") {
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
      } else out.push({ type: "err", text: tt("usageTheme") });
    } else if (c === "lang") {
      const l = args[0];
      if (l === "es" || l === "en") {
        // SPA locale switch via next-intl (no full reload, route preserved).
        const cleanPath = window.location.pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/";
        router.replace(cleanPath as "/", { locale: l as Locale });
      } else out.push({ type: "err", text: tt("usageLang") });
    } else if (c === "open") {
      const toSide = args.includes("--side");
      const target = args.find((a) => a !== "--side");
      const f = IDE_FILES.find((x) => x.filename === target || x.id === target);
      if (f) {
        if (toSide) {
          window.dispatchEvent(
            new CustomEvent("porto-open-file", { detail: { fileId: f.id, toSide: true } })
          );
          out.push({ type: "out", text: `→ ${f.filename} ${tt("openSideSuffix")}` });
        } else go(f.route);
      } else out.push({ type: "err", text: tt("unknownFile", { target: target || "" }) });
    } else if (c === "go") {
      const f = IDE_FILES.find((x) => x.route === args[0] || x.id === args[0]);
      if (f) go(f.route);
      else out.push({ type: "err", text: tt("unknownRoute", { target: args[0] || "" }) });
    } else if (c === "echo") out.push({ type: "out", text: args.join(" ") });
    else if (c === "neofetch")
      out.push(
        { type: "out", text: "pochonski@portfolio" },
        { type: "out", text: "-------------------" },
        { type: "out", text: "OS: Arch Linux x86_64" },
        { type: "out", text: "Host: vscode-portfolio" },
        { type: "out", text: "Shell: porto-sh 1.0" },
        { type: "out", text: "DE: VS Code (web)" },
        { type: "out", text: "Stack: React · Next.js · Supabase" },
        { type: "out", text: "Uptime: always on" }
      );
    else if (c === "sudo")
      out.push({
        type: "err",
        text: tt("sudo"),
      });
    else if (c === "vim")
      out.push(
        { type: "out", text: tt("vim1") },
        { type: "out", text: tt("vim2") }
      );
    else if (c === ":q!") out.push({ type: "out", text: tt("phew") });
    else out.push({ type: "err", text: tt("notFound", { cmd: c }) });

    print(out);
  }

  function complete() {
    const trailingSpace = /\s$/.test(value);
    const parts = value.split(/\s+/).filter((p, i, a) => p !== "" || i === a.length - 1);
    const tokens = trailingSpace ? [...parts.filter(Boolean), ""] : parts;
    let candidates: string[] = [];
    if (tokens.length <= 1) {
      const frag = tokens[0] ?? "";
      candidates = COMMANDS.filter((c) => c.startsWith(frag.toLowerCase()));
    } else {
      const [cmd, ...rest] = tokens;
      const frag = rest[rest.length - 1] ?? "";
      if (cmd === "open" || cmd === "go") {
        const pool = [
          ...IDE_FILES.map((f) => f.filename),
          ...IDE_FILES.map((f) => f.id),
          ...IDE_FILES.map((f) => f.route),
        ];
        candidates = [...new Set(pool)].filter((p) => p.startsWith(frag));
      } else if (cmd === "theme") {
        candidates = THEME_IDS.filter((t) => t.startsWith(frag));
      } else if (cmd === "lang") {
        candidates = ["es", "en"].filter((l) => l.startsWith(frag));
      }
    }
    if (candidates.length === 1) {
      const head = tokens.slice(0, -1).filter(Boolean);
      setValue([...head, candidates[0]].join(" ") + " ");
    } else if (candidates.length > 1) {
      print([
        { type: "in", text: `${prompt} ${value}` },
        { type: "out", text: candidates.join("  ") },
      ]);
    }
  }

  const body = (
    <div ref={bodyRef} role="log" aria-live="polite" onClick={() => inputRef.current?.focus()} className="flex-1 cursor-text overflow-y-auto px-3 pb-2 font-mono text-[13px] leading-[1.7] ide-scroll">
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
          setHi(-1);
          pushTermHistory(v);
          run(v);
        }}
        className="flex items-center gap-2"
      >
        <span className="shrink-0" style={{ color: "var(--ide-accent)" }}>{prompt}</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            const hist = getTermHistory();
            if (e.key === "Tab") {
              e.preventDefault();
              complete();
            } else if (e.key === "l" && e.ctrlKey) {
              e.preventDefault();
              clearTermLines();
            } else if (e.key === "c" && e.ctrlKey) {
              e.preventDefault();
              print([{ type: "in", text: `${prompt} ${value}^C` }]);
              setValue("");
              setHi(-1);
            } else if (e.key === "ArrowUp") {
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
          aria-label={tt("inputLabel")}
        />
      </form>
    </div>
  );

  if (bare) return body;

  return (
    <section
      aria-label={tt("label")}
      className="flex h-56 shrink-0 flex-col border-t"
      style={{ background: "var(--ide-terminal)", borderColor: "var(--ide-border)" }}
    >
      <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-mono" style={{ color: "var(--ide-fg-dim)" }}>
        <span>{tt("header")}</span>
        <button onClick={onClose} aria-label={tt("closeTerminal")} className="px-2 py-0.5 hover:opacity-100">
          ✕
        </button>
      </div>
      {body}
    </section>
  );
}
