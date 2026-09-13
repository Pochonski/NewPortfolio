import { createHighlighter, createCssVariablesTheme, type Highlighter } from "shiki";

// Single highlighter reused across all pages (built once per server instance).
// Theme is `css-variables`: colors resolve from our --shiki-* tokens in
// globals.css, so highlighted code follows the active IDE theme for free.
let cached: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  cached ??= createHighlighter({
    themes: [createCssVariablesTheme()],
    langs: ["tsx", "typescript", "javascript", "json", "markdown", "css"],
  });
  return cached;
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(code, { lang, theme: "css-variables" });
}
