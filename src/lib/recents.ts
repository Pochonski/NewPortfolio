import { IDE_FILES, siteForId } from "./files";
import { STORE_RECENTS } from "./storage-keys";
import { safeGetJSON, safeSetJSON } from "./safe-storage";

// Recently opened files and sites (most recent last). Read on
// mount/render — no subscription needed since every push coincides with a
// groups-state change (openFile / navigation reconcile) that already
// re-renders consumers.

const MAX = 9;

function isKnown(id: string): boolean {
  return IDE_FILES.some((f) => f.id === id) || !!siteForId(id);
}

function load(): string[] {
  const arr = safeGetJSON<unknown>(STORE_RECENTS, []);
  if (!Array.isArray(arr)) return [];
  return arr.filter((id): id is string => typeof id === "string" && isKnown(id));
}

export function readRecents(): string[] {
  if (typeof window === "undefined") return [];
  return load();
}

export function pushRecent(id: string): void {
  if (typeof window === "undefined") return;
  if (!isKnown(id)) return;
  const next = [...load().filter((x) => x !== id), id].slice(-MAX);
  safeSetJSON(STORE_RECENTS, next);
}
