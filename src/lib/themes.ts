export interface IdeTheme {
  id: string;
  name: string;
  publisher: string;
  dark: boolean;
}

export const IDE_THEMES: IdeTheme[] = [
  { id: "porto-dark", name: "Porto Dark", publisher: "Joseph Fonseca", dark: true },
  { id: "porto-light", name: "Porto Light", publisher: "Joseph Fonseca", dark: false },
  { id: "dracula", name: "Dracula", publisher: "Dracula Theme", dark: true },
  { id: "nord", name: "Nord", publisher: "Arctic Ice Studio", dark: true },
  { id: "one-dark", name: "One Dark", publisher: "Binaryify", dark: true },
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
