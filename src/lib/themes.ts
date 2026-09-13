import type { ThemeLogoKind } from "@/components/ide/theme-logos";

export interface IdeTheme {
  id: string;
  name: string;
  publisher: string;
  dark: boolean;
  logo: ThemeLogoKind;
  /** Authentic palette: [background, foreground, accent, syntaxA, syntaxB] */
  palette: [string, string, string, string, string];
}

export const IDE_THEMES: IdeTheme[] = [
  {
    id: "porto-dark",
    name: "Porto Dark",
    publisher: "Joseph Fonseca",
    dark: true,
    logo: "porto-dark",
    palette: ["#1c1c1c", "#aed9e0", "#b8f2e6", "#7ee787", "#7aa2f7"],
  },
  {
    id: "porto-light",
    name: "Porto Light",
    publisher: "Joseph Fonseca",
    dark: false,
    logo: "porto-light",
    palette: ["#fafafa", "#5e6472", "#5e6472", "#0a7a42", "#0f6fde"],
  },
  {
    id: "dracula",
    name: "Dracula",
    publisher: "Dracula Theme",
    dark: true,
    logo: "dracula",
    palette: ["#282a36", "#f8f8f2", "#bd93f9", "#ff79c6", "#50fa7b"],
  },
  {
    id: "nord",
    name: "Nord",
    publisher: "Arctic Ice Studio",
    dark: true,
    logo: "nord",
    palette: ["#2e3440", "#d8dee9", "#88c0d0", "#a3be8c", "#b48ead"],
  },
  {
    id: "one-dark",
    name: "One Dark",
    publisher: "Binaryify",
    dark: true,
    logo: "one-dark",
    palette: ["#282c34", "#abb2bf", "#61afef", "#98c379", "#c678dd"],
  },
];

export const DEFAULT_THEME = "porto-dark";
export const THEME_IDS = IDE_THEMES.map((t) => t.id);

const KEY = "porto-ide-theme";

export function getSavedTheme(): string {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const saved = window.localStorage.getItem(KEY);
  return saved && THEME_IDS.includes(saved) ? saved : DEFAULT_THEME;
}

export function applyTheme(id: string) {
  const theme = THEME_IDS.includes(id) ? id : DEFAULT_THEME;
  document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {
    /* ignore */
  }
  return theme;
}

export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('porto-ide-theme')||'porto-dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','porto-dark');}})();`;
