import { IDE_FILES } from "./files";

// Recently opened files (most recent last). Read on mount/render — no
// subscription needed since every push coincides with a groups-state change
// (openFile / navigation reconcile) that already re-renders consumers.

const KEY = "porto-recents";
const MAX = 9;

function load(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = JSON.parse(raw ?? "[]") as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (id): id is string =>
        typeof id === "string" && IDE_FILES.some((f) => f.id === id)
    );
  } catch {
    return [];
  }
}

export function readRecents(): string[] {
  if (typeof window === "undefined") return [];
  return load();
}

export function pushRecent(fileId: string): void {
  if (typeof window === "undefined") return;
  if (!IDE_FILES.some((f) => f.id === fileId)) return;
  try {
    const next = [...load().filter((id) => id !== fileId), fileId].slice(-MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked */
  }
}
