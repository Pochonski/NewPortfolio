// Output channel log ("Log (Portfolio)"): navigation, theme, contact events.
// Session-scoped like VS Code output channels (not persisted).

export interface LogEntry {
  time: number;
  message: string;
}

const MAX = 200;

let entries: LogEntry[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeOutput(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getOutputEntries(): LogEntry[] {
  return entries;
}

export function logOutput(message: string): void {
  entries = [...entries, { time: Date.now(), message }].slice(-MAX);
  notify();
}

export function clearOutput(): void {
  entries = [];
  notify();
}
