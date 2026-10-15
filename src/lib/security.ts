/** Cap para el mapa en memoria: purga oportunista de ventanas vencidas. */
const MAX_KEYS = 2000;

const hits = new Map<string, { count: number; resetAt: number }>();

function sweep(now: number) {
  if (hits.size < MAX_KEYS) return;
  for (const [k, v] of hits) {
    if (now > v.resetAt) hits.delete(k);
    if (hits.size < MAX_KEYS / 2) break;
  }
}

/** Rate-limit en memoria (v1, single instance). Para multi-instancia usar Upstash. */
export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  sweep(now);
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

/** Extrae la IP real priorizando headers de proxy/CDN sobre x-forwarded-for crudo. */
export function getClientIp(req: Request): string {
  const h = (n: string) => req.headers.get(n)?.split(",")[0]?.trim();
  return h("cf-connecting-ip") || h("x-real-ip") || h("x-forwarded-for") || "unknown";
}
