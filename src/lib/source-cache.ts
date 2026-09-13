// Client-side cache for file sources (code + highlighted HTML).
// Read during render, updated via fetch/seed; subscribers re-render.

export interface SourcePayload {
  code: string;
  codeHtml?: string;
}

const cache = new Map<string, SourcePayload>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeSource(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function sourceKey(locale: string, fileId: string, tag = ""): string {
  return `${locale}:${fileId}:${tag}`;
}

export function readSource(key: string): SourcePayload | undefined {
  return cache.get(key);
}

export function seedSource(key: string, payload: SourcePayload): void {
  const prev = cache.get(key);
  const merged: SourcePayload = {
    code: payload.code,
    codeHtml: payload.codeHtml ?? (prev?.code === payload.code ? prev.codeHtml : undefined),
  };
  if (prev?.code === merged.code && prev?.codeHtml === merged.codeHtml) return;
  cache.set(key, merged);
  notify();
}

export async function fetchSource(
  key: string,
  fileId: string,
  locale: string,
  theme: string
): Promise<void> {
  if (cache.get(key)?.codeHtml) return;
  const res = await fetch(
    `/api/source?file=${encodeURIComponent(fileId)}&locale=${encodeURIComponent(locale)}&theme=${encodeURIComponent(theme)}`
  );
  if (!res.ok) throw new Error(`source ${res.status}`);
  const data = (await res.json()) as SourcePayload;
  seedSource(key, { code: data.code, codeHtml: data.codeHtml });
}
