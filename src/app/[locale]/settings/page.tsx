"use client";

import { useEffect, useState } from "react";
import { Check, Palette } from "lucide-react";
import { IDE_THEMES, getSavedTheme, applyTheme } from "@/lib/themes";
import { settingsJsonString } from "@/lib/file-sources";
import { SplitView } from "@/components/ide/SplitView";
import { RegisterSource } from "@/components/ide/editors-context";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export default function SettingsPage() {
  const [theme, setTheme] = useState("porto-dark");
  const [loaded, setLoaded] = useState(false);
  const locale = useLocale();
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
    router.replace(next === "es" ? (clean as "/") : (`/${next}${clean === "/" ? "" : clean}` as "/"));
  }

  if (!loaded) return null;

  return (
    <div className="flex h-full w-full flex-col">
      <h1 className="sr-only">Settings</h1>
      <RegisterSource fileId="settings" code={settingsJsonString(theme, locale)} />
      <div className="flex min-h-0 flex-1 flex-col">
        <SplitView
          preview={
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold" style={{ color: "var(--ide-fg-bright)" }}>
                <Palette size={18} style={{ color: "var(--ide-accent)" }} /> Settings
              </h2>
              <h3 className="mb-4 font-mono text-xs tracking-wider uppercase" style={{ color: "var(--ide-fg-dim)" }}>
                Color Theme
              </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {IDE_THEMES.map((t) => {
          const active = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => pick(t.id)}
              aria-pressed={active}
              className="rounded-lg border p-4 text-left transition-transform hover:-translate-y-0.5"
              style={{
                borderColor: active ? "var(--ide-accent)" : "var(--ide-border)",
                background: "var(--ide-terminal)",
              }}
            >
              <span className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: "var(--ide-fg-bright)" }}>{t.name}</span>
                {active && <Check size={15} style={{ color: "var(--ide-accent)" }} />}
              </span>
              <span className="mt-1 block font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>{t.publisher}</span>
              <span className="mt-3 flex gap-1" aria-hidden>
                {["var(--ide-accent)", "var(--ide-fg)", "var(--ide-border)"].map((c, i) => (
                  <i key={i} className="h-4 w-8 rounded-sm border" style={{ background: c, borderColor: "var(--ide-border)" }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <h2 className="mt-10 mb-4 font-mono text-xs tracking-wider uppercase" style={{ color: "var(--ide-fg-dim)" }}>
        Language / Idioma
      </h2>
      <div className="flex gap-2">
        {(["es", "en"] as const).map((l) => (
          <button
            key={l}
            onClick={() => switchLang(l)}
            aria-pressed={locale === l}
            className="rounded-md border px-4 py-2 font-mono text-[13px]"
            style={{
              borderColor: locale === l ? "var(--ide-accent)" : "var(--ide-border)",
              color: locale === l ? "var(--ide-accent)" : "var(--ide-fg)",
            }}
          >
            {l === "es" ? "Español" : "English"}
          </button>
        ))}
      </div>

      <div className="mt-10 rounded-lg border p-4 font-mono text-xs leading-6" style={{ borderColor: "var(--ide-border)", background: "var(--ide-terminal)", color: "var(--ide-fg-dim)" }}>
        &quot;terminal&quot;: true, &quot;palette&quot;: true — {locale === "es" ? "edita el tema y mira settings.json actualizarse" : "change the theme and watch settings.json update"}
      </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
