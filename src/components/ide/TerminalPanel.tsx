"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { IDE_FILES } from "@/lib/files";
import { THEME_IDS, setTheme } from "@/lib/themes";
import { trackEvent } from "@/lib/analytics";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import {
  clearTermLines,
  getTermHistory,
  getTermLines,
  pushTermHistory,
  pushTermLines,
  subscribeTerminal,
  type TermLine,
  type TermSpan,
  type TermTone,
} from "@/lib/terminal-store";

const TONE_COLOR: Record<TermTone, string> = {
  accent: "var(--ide-accent)",
  bright: "var(--ide-fg-bright)",
  dim: "var(--ide-fg-dim)",
};

// Grouped, column-aligned help: group titles + commands in accent,
// descriptions dim. Built from i18n so it stays bilingual.
function helpLines(t: (key: string) => string): TermLine[] {
  const groups: { title: string; rows: [string, string][] }[] = [
    {
      title: t("helpNav"),
      rows: [
        ["open <archivo>", t("helpOpenDesc")],
        ["go <ruta>", t("helpGoDesc")],
        ["about · skills · projects · contact · socials", t("helpShortcutsDesc")],
        ["cv", t("helpCvDesc")],
      ],
    },
    {
      title: t("helpSys"),
      rows: [
        ["ls · pwd · whoami · date", t("helpUtilsDesc")],
        ["split", t("helpSplitDesc")],
        ["themes · theme <id>", t("helpThemesDesc")],
        ["lang <es|en> · echo · clear", t("helpMiscDesc")],
        ["stats", t("helpStatsDesc")],
      ],
    },
    {
      title: t("helpFun"),
      rows: [["neofetch · sudo · vim", t("helpFunDesc")]],
    },
  ];
  const width = Math.max(...groups.flatMap((g) => g.rows.map(([cmd]) => cmd.length)));
  const line = (text: string, spans?: TermSpan[]): TermLine =>
    spans ? { type: "out", text, spans } : { type: "out", text };
  const out: TermLine[] = [
    line(t("available"), [{ text: t("available"), tone: "bright" }]),
    line(""),
  ];
  for (const g of groups) {
    out.push(line(`  ${g.title}`, [{ text: `  ${g.title}`, tone: "accent" }]));
    for (const [cmd, desc] of g.rows) {
      const padded = cmd.padEnd(width);
      out.push({
        type: "out",
        text: `    ${padded}  ${desc}`,
        spans: [
          { text: `    ${padded}`, tone: "accent" },
          { text: `  ${desc}`, tone: "dim" },
        ],
      });
    }
    out.push(line(""));
  }
  out.push(line(t("helpTip"), [{ text: t("helpTip"), tone: "dim" }]));
  return out;
}

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
  "stats",
  "clear",
  "neofetch",
  "sudo",
  "vim",
  ":q!",
];

const LOGO = [
  "      ██╗███████╗",
  "      ██║██╔════╝",
  "      ██║█████╗  ",
  " ██   ██║██╔══╝  ",
  " ╚█████╔╝██║     ",
  "  ╚════╝ ╚═╝     ",
];

export function TerminalPanel({ onClose, bare }: { onClose: () => void; bare?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
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

    // `label: value` line with dim label + accent value.
    const stat = (label: string, value: string): TermLine => ({
      type: "out",
      text: `${label}: ${value}`,
      spans: [
        { text: `${label}: `, tone: "dim" },
        { text: value, tone: "accent" },
      ],
    });

    if (c === "help" || c === "ayuda") out.push(...helpLines(tt));
    else if (c === "ls")
      out.push({
        type: "out",
        text: IDE_FILES.map((f) => f.filename).join("  "),
        spans: IDE_FILES.flatMap((f, i): TermSpan[] =>
          i === 0
            ? [{ text: f.filename, tone: "bright" }]
            : [
                { text: "  ", tone: "dim" },
                { text: f.filename, tone: "bright" },
              ]
        ),
      });
    else if (c === "pwd") out.push({ type: "out", text: "/home/pochonski/portfolio" });
    else if (c === "whoami") out.push({ type: "out", text: tt("whoami") });
    else if (c === "date")
      out.push({
        type: "out",
        text: new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "medium" }).format(
          new Date()
        ),
      });
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
    } else if (c === "themes") {
      const current =
        typeof document !== "undefined"
          ? document.documentElement.getAttribute("data-theme") ?? ""
          : "";
      out.push({
        type: "out",
        text: THEME_IDS.join("  "),
        spans: THEME_IDS.flatMap((id, i): TermSpan[] => {
          const seg: TermSpan[] =
            id === current
              ? [{ text: `● ${id}`, tone: "accent" }]
              : [{ text: `○ ${id}`, tone: "dim" }];
          return i === 0 ? seg : [{ text: "  ", tone: "dim" }, ...seg];
        }),
      });
    } else if (c === "stats") {
      out.push(
        {
          type: "out",
          text: tt("statsTitle"),
          spans: [{ text: tt("statsTitle"), tone: "bright" }],
        },
        stat(tt("statsFiles"), String(IDE_FILES.length)),
        stat(tt("statsThemes"), String(THEME_IDS.length)),
        stat(tt("statsCommands"), String(COMMANDS.length)),
        stat(tt("statsLocale"), locale)
      );
    }
    else if (c === "theme") {
      const id = args[0];
      if (id && THEME_IDS.includes(id)) {
        setTheme(id);
        out.push({ type: "out", text: tt("themeSet", { id }) });
      } else out.push({ type: "err", text: tt("usageTheme") });
    } else if (c === "lang") {
      const l = args[0];
      if (l === "es" || l === "en") {
        // SPA locale switch via next-intl (no full reload, route preserved).
        const cleanPath = window.location.pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/";
        router.replace(cleanPath as "/", { locale: l as Locale });
      } else out.push({ type: "err", text: tt("usageLang") });
    } else if (c === "open") {
      const target = (args[0] ?? "").toLowerCase();
      let f = IDE_FILES.find((x) => x.filename.toLowerCase() === target || x.id === target);
      if (!f && target) {
        const cands = IDE_FILES.filter(
          (x) =>
            x.filename.toLowerCase().includes(target) ||
            x.id.includes(target) ||
            x.route.includes(target)
        );
        if (cands.length === 1) f = cands[0];
        else if (cands.length > 1) {
          out.push(
            { type: "err", text: tt("openAmbiguous") },
            {
              type: "out",
              text: cands.map((x) => x.filename).join("  "),
              spans: cands.flatMap((x, i): TermSpan[] =>
                i === 0
                  ? [{ text: x.filename, tone: "bright" }]
                  : [
                      { text: "  ", tone: "dim" },
                      { text: x.filename, tone: "bright" },
                    ]
              ),
            }
          );
        }
      }
      if (f) {
        go(f.route);
      } else if (!out.some((l) => l.type === "err")) {
        out.push({ type: "err", text: tt("unknownFile", { target: target || "" }) });
      }
    } else if (c === "go") {
      const f = IDE_FILES.find((x) => x.route === args[0] || x.id === args[0]);
      if (f) go(f.route);
      else out.push({ type: "err", text: tt("unknownRoute", { target: args[0] || "" }) });
    } else if (c === "echo") out.push({ type: "out", text: args.join(" ") });
    else if (c === "neofetch")
      out.push(
        ...LOGO.map(
          (g): TermLine => ({ type: "out", text: g, spans: [{ text: g, tone: "accent" }] })
        ),
        {
          type: "out",
          text: "pochonski@portfolio",
          spans: [{ text: "pochonski@portfolio", tone: "bright" }],
        },
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
          {l.spans
            ? l.spans.map((s, j) => (
                <span key={j} style={{ color: TONE_COLOR[s.tone] }}>
                  {s.text}
                </span>
              ))
            : l.text}
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
