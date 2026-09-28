// Persistent terminal session: lines + history survive unmounts and reloads.
// Components subscribe and re-render on change (same pattern as source-cache).

export type TermTone = "accent" | "bright" | "dim";

export interface TermSpan {
  text: string;
  tone: TermTone;
}

export interface TermLine {
  type: "in" | "out" | "err";
  text: string;
  /** Rich segments rendered instead of plain text (optional, persisted). */
  spans?: TermSpan[];
}

import { STORE_TERM_HISTORY, STORE_TERM_LINES } from "./storage-keys";
import { safeGetJSON, safeSetJSON } from "./safe-storage";

const LINES_KEY = STORE_TERM_LINES;
const HIST_KEY = STORE_TERM_HISTORY;
const MAX_LINES = 300;
const MAX_HIST = 200;

let lines: TermLine[] = [];
let history: string[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

const VALID_TONES: TermTone[] = ["accent", "bright", "dim"];

function validSpan(s: unknown): s is TermSpan {
  if (!s || typeof s !== "object") return false;
  const o = s as Record<string, unknown>;
  return typeof o.text === "string" && (o.tone === undefined || (typeof o.tone === "string" && (VALID_TONES as string[]).includes(o.tone)));
}

function validLine(l: unknown): l is TermLine {
  if (!l || typeof l !== "object") return false;
  const o = l as Record<string, unknown>;
  if (!(o.type === "in" || o.type === "out" || o.type === "err") || typeof o.text !== "string") return false;
  if (o.spans !== undefined) {
    if (!Array.isArray(o.spans) || !o.spans.every(validSpan)) return false;
  }
  return true;
}

function load() {
  const l = safeGetJSON<unknown>(LINES_KEY, []);
  if (Array.isArray(l)) lines = l.filter(validLine).slice(-MAX_LINES);
  const h = safeGetJSON<unknown>(HIST_KEY, []);
  if (Array.isArray(h)) {
    history = h.filter((s): s is string => typeof s === "string").slice(-MAX_HIST);
  }
}

function save() {
  safeSetJSON(LINES_KEY, lines);
  safeSetJSON(HIST_KEY, history);
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
