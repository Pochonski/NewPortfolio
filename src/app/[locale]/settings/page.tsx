"use client";

import { useEffect, useState } from "react";
import { Braces, Check, Globe, Moon, Settings as SettingsIcon, Sun, TerminalSquare } from "lucide-react";
import { IDE_THEMES, getSavedTheme, applyTheme } from "@/lib/themes";
import { settingsJsonString } from "@/lib/file-sources";
import { SplitView } from "@/components/ide/SplitView";
import { RegisterSource } from "@/components/ide/editors-context";
import { ThemeLogo } from "@/components/ide/theme-logos";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export default function SettingsPage() {
  const [theme, setTheme] = useState("porto-dark");
  const [loaded, setLoaded] = useState(false);
  const locale = useLocale();
  const st = useTranslations("settings");
  const router = useRouter();
  const pathname = usePathname();

  // Hydration-safe: render default first, then sync saved theme on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount sync
    setTheme(getSavedTheme());
    setLoaded(true);
  }, []);

  function pick(id: string) {
    setTheme(applyTheme(id));
    window.dispatchEvent(new CustomEvent("porto-theme", { detail: id }));
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
              {/* Header */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl border"
                  style={{
                    background: "var(--ide-terminal)",
                    borderColor: "var(--ide-border)",
                    color: "var(--ide-accent)",
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
                  className="flex items-center gap-2 rounded-full border py-1 pr-3 pl-1"
                  style={{ borderColor: "var(--ide-border)", background: "var(--ide-terminal)" }}
                  title={`${activeTheme.name} — ${activeTheme.publisher}`}
                >
                  <ThemeLogo kind={activeTheme.logo} size={22} />
                  <span className="text-xs font-semibold" style={{ color: "var(--ide-fg-bright)" }}>
                    {activeTheme.name}
                  </span>
                </span>
              </div>

              {/* Color theme */}
              <h3
                className="mb-3 flex items-center gap-2 font-mono text-xs tracking-wider uppercase"
                style={{ color: "var(--ide-fg-dim)" }}
              >
                <span aria-hidden className="h-px w-4" style={{ background: "var(--ide-accent)" }} />
                {st("themeSection")}
                <span
                  className="rounded-full border px-2 py-0.5 font-mono text-[10px] normal-case"
                  style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)" }}
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
                      className="group rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      style={{
                        borderColor: active ? "var(--ide-accent)" : "var(--ide-border)",
                        background: "var(--ide-terminal)",
                        boxShadow: active ? "0 0 0 1px var(--ide-accent)" : undefined,
                      }}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <ThemeLogo kind={t.logo} size={32} />
                        <span className="flex items-center gap-1.5">
                          <span
                            className="flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px]"
                            style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)" }}
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
                      <span className="mt-3 flex overflow-hidden rounded-md border" aria-hidden style={{ borderColor: "var(--ide-border)" }}>
                        {t.palette.map((c, i) => (
                          <i key={`${c}-${i}`} className="h-5 flex-1" style={{ background: c }} title={c} />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Language */}
              <h3
                className="mt-8 mb-3 flex items-center gap-2 font-mono text-xs tracking-wider uppercase"
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
                      className="flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor: selected ? "var(--ide-accent)" : "var(--ide-border)",
                        background: "var(--ide-terminal)",
                        boxShadow: selected ? "0 0 0 1px var(--ide-accent)" : undefined,
                      }}
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

              {/* Live-sync hint */}
              <div
                className="mt-8 flex items-center gap-3 rounded-xl border p-4"
                style={{ borderColor: "var(--ide-border)", background: "var(--ide-terminal)" }}
              >
                <span className="flex gap-1.5" aria-hidden>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: "var(--ide-bg)", color: "var(--ide-accent)" }}
                  >
                    <TerminalSquare size={16} />
                  </span>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: "var(--ide-bg)", color: "var(--ide-fg)" }}
                  >
                    <Braces size={16} />
                  </span>
                </span>
                <p className="font-mono text-xs leading-5" style={{ color: "var(--ide-fg-dim)" }}>
                  <span style={{ color: "var(--ide-accent)" }}>settings.json</span>
                  {" — "}
                  {st("syncHint")}
                </p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
