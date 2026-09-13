import {
  createHighlighter,
  createCssVariablesTheme,
  type Highlighter,
  type ShikiTransformer,
} from "shiki";

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
  return hl.codeToHtml(code, { lang, theme: "css-variables", transformers: [indentGuides()] });
}

// Adds --n (indent levels, 2 spaces each) to every line so CSS can paint
// VS Code-style indent guides. Structure untouched: find indexing safe.
function indentGuides(): ShikiTransformer {
  return {
    name: "porto-indent-guides",
    line(node) {
      let spaces = "";
      const walk = (n: { type?: string; value?: string; children?: unknown[] }): boolean => {
        if (n.type === "text" && typeof n.value === "string") {
          const m = /^[\t ]*/.exec(n.value);
          const w = m ? m[0] : "";
          spaces += w;
          return n.value.length === w.length;
        }
        if (n.type === "element" && Array.isArray(n.children)) {
          for (const c of n.children) {
            if (!walk(c as { type?: string; value?: string; children?: unknown[] })) return false;
          }
          return true;
        }
        return false;
      };
      for (const child of node.children ?? []) {
        if (!walk(child as { type?: string; value?: string; children?: unknown[] })) break;
      }
      const levels = Math.floor(spaces.replace(/\t/g, "  ").length / 2);
      if (levels > 0) {
        node.properties = { ...(node.properties ?? {}), style: `--n: ${levels}` };
      }
    },
  };
}
