"use client";

import { useEffect, useState } from "react";
import { Braces, Check, Globe, Moon, Settings as SettingsIcon, Sun, TerminalSquare } from "lucide-react";
import { IDE_THEMES, getSavedTheme, setTheme } from "@/lib/themes";
import { settingsJsonString } from "@/lib/file-sources";
import { SplitView } from "@/components/ide/SplitView";
import { RegisterSource } from "@/components/ide/editors-context";
import { ThemeLogo } from "@/components/ide/theme-logos";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

const HAIRLINE: React.CSSProperties = {
  height: 1,
  background:
    "linear-gradient(to right, rgba(var(--ide-accent-rgb), 0.45), rgba(var(--ide-accent-rgb), 0))",
};

export default function SettingsPage() {
  const [theme, setThemeState] = useState("porto-dark");
  const [loaded, setLoaded] = useState(false);
  const locale = useLocale();
  const st = useTranslations("settings");
  const router = useRouter();
  const pathname = usePathname();

  // Hydration-safe: render default first, then sync saved theme on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount sync
    setThemeState(getSavedTheme());
    setLoaded(true);
  }, []);

  function pick(id: string) {
    setThemeState(setTheme(id));
  }

  function switchLang(next: string) {
    const clean = pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/";
    // next-intl router prefixes the locale itself ("as-needed": es → no
    // prefix, en → /en), so pass the bare path + target locale.
    router.replace(clean as "/", { locale: next as Locale });
  }

  if (!loaded) return null;

  const activeTheme = IDE_THEMES.find((t) => t.id === theme) ?? IDE_THEMES[0];

  return (
    <div className="flex h-full w-full flex-col">
      <h1 className="sr-only">{st("title")}</h1>
      <RegisterSource fileId="settings" code={settingsJsonString(theme, locale)} />
      <div className="flex min-h-0 flex-1 flex-col">
        <SplitView
          preview={
            <div className="mx-auto w-full max-w-3xl">
              {/* Header strip: glass-subtle floating band above the panel */}
              <div className="rise glass-subtle mb-4 flex flex-wrap items-center gap-3 rounded-xl p-3.5">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(var(--ide-accent-rgb), 0.12)",
                    color: "var(--ide-accent)",
                    border: "1px solid rgba(var(--ide-accent-rgb), 0.4)",
                    boxShadow: "0 8px 24px rgba(var(--ide-accent-rgb), 0.18)",
                  }}
                >
                  <SettingsIcon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold" style={{ color: "var(--ide-fg-bright)" }}>
                    {st("title")}
                  </h2>
                  <p className="truncate font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
                    {st("subtitle")}
                  </p>
                </div>
                <span
                  className="glass-subtle flex items-center gap-2 rounded-full py-1 pr-3 pl-1"
                  title={`${activeTheme.name} — ${activeTheme.publisher}`}
                >
                  <ThemeLogo kind={activeTheme.logo} size={22} />
                  <span className="text-xs font-semibold" style={{ color: "var(--ide-fg-bright)" }}>
                    {activeTheme.name}
                  </span>
                </span>
              </div>

              {/* Single panel glass-strong containing all sections */}
              <div className="rise rise-1 glass-strong rounded-2xl p-5 sm:p-6">
                {/* APPEARANCE */}
                <section aria-label={st("themeSection")}>
                  <h3
                    className="mb-3 flex items-center gap-2 font-mono text-xs tracking-wider uppercase"
                    style={{ color: "var(--ide-fg-dim)" }}
                  >
                    <span aria-hidden className="h-px w-4" style={{ background: "var(--ide-accent)" }} />
                    {st("themeSection")}
                    <span
                      className="glass-subtle rounded-full px-2 py-0.5 font-mono text-[10px] normal-case"
                      style={{ color: "var(--ide-fg-dim)" }}
                    >
                      {IDE_THEMES.length}
                    </span>
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {IDE_THEMES.map((t) => {
                      const active = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => pick(t.id)}
                          aria-pressed={active}
                          className={`glass hover-glass group rounded-xl p-4 text-left`}
                          style={
                            active
                              ? { borderColor: "var(--ide-accent)", boxShadow: "0 0 0 1px var(--ide-accent)" }
                              : undefined
                          }
                        >
                          <span className="flex items-start justify-between gap-2">
                            <ThemeLogo kind={t.logo} size={32} />
                            <span className="flex items-center gap-1.5">
                              <span
                                className="glass-subtle flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px]"
                                style={{ color: "var(--ide-fg-dim)" }}
                              >
                                {t.dark ? <Moon size={10} /> : <Sun size={10} />}
                                {t.dark ? st("dark") : st("light")}
                              </span>
                              {active && (
                                <span
                                  className="flex h-5 w-5 items-center justify-center rounded-full"
                                  style={{ background: "var(--ide-accent)", color: "var(--ide-terminal)" }}
                                >
                                  <Check size={12} strokeWidth={3} />
                                </span>
                              )}
                            </span>
                          </span>
                          <span
                            className="mt-3 block text-sm font-semibold"
                            style={{ color: "var(--ide-fg-bright)" }}
                          >
                            {t.name}
                          </span>
                          <span
                            className="mt-0.5 block truncate font-mono text-[11px]"
                            style={{ color: "var(--ide-fg-dim)" }}
                          >
                            {t.publisher}
                          </span>
                          {/* Authentic palette strip */}
                          <span
                            className="mt-3 flex overflow-hidden rounded-md border"
                            aria-hidden
                            style={{ borderColor: "var(--ide-border)" }}
                          >
                            {t.palette.map((c, i) => (
                              <i key={`${c}-${i}`} className="h-5 flex-1" style={{ background: c }} title={c} />
                            ))}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <div className="my-6" style={HAIRLINE} />

                {/* LANGUAGE */}
                <section aria-label={st("languageSection")}>
                  <h3
                    className="mb-3 flex items-center gap-2 font-mono text-xs tracking-wider uppercase"
                    style={{ color: "var(--ide-fg-dim)" }}
                  >
                    <span aria-hidden className="h-px w-4" style={{ background: "var(--ide-accent)" }} />
                    {st("languageSection")}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["es", "en"] as const).map((l) => {
                      const selected = locale === l;
                      return (
                        <button
                          key={l}
                          onClick={() => switchLang(l)}
                          aria-pressed={selected}
                          className={`glass-subtle hover-glass flex items-center gap-3 rounded-xl p-4 text-left`}
                          style={
                            selected
                              ? { borderColor: "var(--ide-accent)", boxShadow: "0 0 0 1px var(--ide-accent)" }
                              : undefined
                          }
                        >
                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-lg border font-mono text-[11px] font-bold"
                            style={{
                              borderColor: "var(--ide-border)",
                              background: "var(--ide-bg)",
                              color: selected ? "var(--ide-accent)" : "var(--ide-fg)",
                            }}
                          >
                            {l.toUpperCase()}
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm font-semibold" style={{ color: "var(--ide-fg-bright)" }}>
                              {l === "es" ? st("esName") : st("enName")}
                            </span>
                            <span className="block font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
                              {l === "es" ? st("esDesc") : st("enDesc")}
                            </span>
                          </span>
                          <Globe size={16} style={{ color: selected ? "var(--ide-accent)" : "var(--ide-fg-dim)" }} />
                          {selected && <Check size={15} style={{ color: "var(--ide-accent)" }} />}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <div className="my-6" style={HAIRLINE} />

                {/* SYSTEM — sync hint row */}
                <section aria-label="sync" className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="h-7 w-1 shrink-0 rounded-full"
                    style={{
                      background: "var(--ide-accent)",
                      boxShadow: "0 0 12px rgba(var(--ide-accent-rgb), 0.6)",
                    }}
                  />
                  <span className="flex gap-1.5" aria-hidden>
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-md"
                      style={{ background: "var(--ide-bg)", color: "var(--ide-accent)" }}
                    >
                      <TerminalSquare size={14} />
                    </span>
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-md"
                      style={{ background: "var(--ide-bg)", color: "var(--ide-fg)" }}
                    >
                      <Braces size={14} />
                    </span>
                  </span>
                  <p className="flex-1 font-mono text-xs leading-5" style={{ color: "var(--ide-fg-dim)" }}>
                    <span style={{ color: "var(--ide-accent)" }}>settings.json</span>
                    {" — "}
                    {st("syncHint")}
                  </p>
                </section>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
