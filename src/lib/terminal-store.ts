// Persistent terminal session: lines + history survive unmounts and reloads.
// Components subscribe and re-render on change (same pattern as source-cache).

export interface TermLine {
  type: "in" | "out" | "err";
  text: string;
}

const LINES_KEY = "porto-terminal-lines";
const HIST_KEY = "porto-terminal-history";
const MAX_LINES = 300;
const MAX_HIST = 200;

let lines: TermLine[] = [];
let history: string[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

function validLine(l: unknown): l is TermLine {
  if (!l || typeof l !== "object") return false;
  const o = l as Record<string, unknown>;
  return (
    (o.type === "in" || o.type === "out" || o.type === "err") &&
    typeof o.text === "string"
  );
}

function load() {
  try {
    const l = window.localStorage.getItem(LINES_KEY);
    if (l) {
      const arr = JSON.parse(l) as unknown;
      if (Array.isArray(arr)) lines = arr.filter(validLine).slice(-MAX_LINES);
    }
    const h = window.localStorage.getItem(HIST_KEY);
    if (h) {
      const arr = JSON.parse(h) as unknown;
      if (Array.isArray(arr)) {
        history = arr.filter((s): s is string => typeof s === "string").slice(-MAX_HIST);
      }
    }
  } catch {
    /* storage unavailable/corrupt → start fresh */
  }
}

function save() {
  try {
    window.localStorage.setItem(LINES_KEY, JSON.stringify(lines));
    window.localStorage.setItem(HIST_KEY, JSON.stringify(history));
  } catch {
    /* storage blocked */
  }
}

if (typeof window !== "undefined") load();

export function subscribeTerminal(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getTermLines(): TermLine[] {
  return lines;
}

export function getTermHistory(): string[] {
  return history;
}

export function pushTermLines(extra: TermLine[]): void {
  lines = [...lines, ...extra].slice(-MAX_LINES);
  save();
  notify();
}

export function pushTermHistory(cmd: string): void {
  const t = cmd.trim();
  if (!t) return;
  history = [...history, t].slice(-MAX_HIST);
  save();
  notify();
}

export function clearTermLines(): void {
  lines = [];
  save();
  notify();
}
