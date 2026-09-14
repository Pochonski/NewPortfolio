import { IDE_FILES, siteForId } from "./files";
import { STORE_RECENTS } from "./storage-keys";

// Recently opened files and sites (most recent last). Read on
// mount/render — no subscription needed since every push coincides with a
// groups-state change (openFile / navigation reconcile) that already
// re-renders consumers.

const MAX = 9;

function isKnown(id: string): boolean {
  return IDE_FILES.some((f) => f.id === id) || !!siteForId(id);
}

function load(): string[] {
  try {
    const raw = window.localStorage.getItem(STORE_RECENTS);
    const arr = JSON.parse(raw ?? "[]") as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((id): id is string => typeof id === "string" && isKnown(id));
  } catch {
    return [];
  }
}

export function readRecents(): string[] {
  if (typeof window === "undefined") return [];
  return load();
}

export function pushRecent(id: string): void {
  if (typeof window === "undefined") return;
  if (!isKnown(id)) return;
  try {
    const next = [...load().filter((x) => x !== id), id].slice(-MAX);
    window.localStorage.setItem(STORE_RECENTS, JSON.stringify(next));
  } catch {
    /* storage blocked */
  }
}
