import { cookies, headers } from "next/headers";
import esMessages from "../../messages/es.json";
import enMessages from "../../messages/en.json";
import { WindowDots, ctaClass, ctaStyle } from "@/components/chrome";

// Definitive 404: this is what actually renders for every unknown route
// (Next 16 ignores [locale]/not-found in this setup — verified). No
// providers available here, so locale comes from the NEXT_LOCALE cookie
// (set by next-intl while browsing) with Accept-Language fallback, and
// links are plain anchors. Inherits root layout (theme + fonts).
export default async function GlobalNotFound() {
  const store = await cookies();
  const cookieLocale = store.get("NEXT_LOCALE")?.value;
  const accept = (await headers()).get("accept-language") ?? "";
  const en = cookieLocale === "en" || (cookieLocale !== "es" && accept.toLowerCase().startsWith("en"));
  const dict = (en ? enMessages : esMessages).notfound as {
    heading: string;
    body: string;
    home: string;
    projects: string;
    hint: string;
  };

  return (
    <div
      className="mx-auto flex min-h-[70dvh] w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center"
      style={{ background: "var(--ide-bg)", color: "var(--ide-fg)" }}
    >
      <p className="font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
        portfolio › 404
      </p>
      <p
        className="mt-4 text-7xl font-bold"
        style={{
          color: "var(--ide-accent)",
          textShadow: "0 0 48px rgba(var(--ide-accent-rgb), 0.45)",
        }}
      >
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold" style={{ color: "var(--ide-fg-bright)" }}>
        {dict.heading}
      </h1>
      <p className="mt-2 max-w-md text-sm" style={{ color: "var(--ide-fg-dim)" }}>
        {dict.body}
      </p>

      <div
        className="mt-8 w-full max-w-md overflow-hidden rounded-xl border text-left"
        style={{
          borderColor: "var(--ide-border)",
          background: "var(--ide-terminal)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          className="flex items-center gap-1.5 border-b px-4 py-2.5"
          style={{ borderColor: "var(--ide-border)" }}
        >
          <WindowDots />
          <span className="ml-2 font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
            pochonski@portfolio: ~
          </span>
        </div>
        <div className="flex flex-col gap-1 px-4 py-3 font-mono text-[13px]">
          <p>
            <span style={{ color: "var(--ide-accent)" }}>$ </span>
            <span style={{ color: "var(--ide-fg-bright)" }}>porto open ./esa-ruta</span>
          </p>
          <p style={{ color: "var(--ide-error)" }}>error 404: route not found</p>
          <p style={{ color: "var(--ide-fg-dim)" }}>$ _</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={en ? "/en" : "/"} className={ctaClass()} style={ctaStyle("primary")}>
          {dict.home}
        </a>
        <a href={en ? "/en/projects" : "/projects"} className={ctaClass()} style={ctaStyle("ghost")}>
          {dict.projects}
        </a>
      </div>
      <p className="mt-6 font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
        {dict.hint}
      </p>
    </div>
  );
}
