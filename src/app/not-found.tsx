import { cookies, headers } from "next/headers";
import esMessages from "../../messages/es.json";
import enMessages from "../../messages/en.json";

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

  const btnPrimary: React.CSSProperties = {
    background: "var(--ide-button)",
    color: "var(--ide-button-fg)",
  };
  const btnGhost: React.CSSProperties = {
    border: "1px solid var(--ide-accent)",
    color: "var(--ide-accent)",
  };

  return (
    <div
      className="mx-auto flex min-h-[70dvh] w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center"
      style={{ background: "var(--ide-bg)", color: "var(--ide-fg)" }}
    >
      <p className="font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
        portfolio › 404
      </p>
      <p className="mt-4 text-7xl font-bold" style={{ color: "var(--ide-accent)" }}>
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold" style={{ color: "var(--ide-fg-bright)" }}>
        {dict.heading}
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--ide-fg-dim)" }}>
        {dict.body}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={en ? "/en" : "/"}
          className="rounded-md px-5 py-2.5 text-sm font-semibold"
          style={btnPrimary}
        >
          {dict.home}
        </a>
        <a
          href={en ? "/en/projects" : "/projects"}
          className="rounded-md px-5 py-2.5 text-sm font-semibold"
          style={btnGhost}
        >
          {dict.projects}
        </a>
      </div>
      <p className="mt-6 font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
        {dict.hint}
      </p>
    </div>
  );
}
