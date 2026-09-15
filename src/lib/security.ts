const hits = new Map<string, { count: number; resetAt: number }>();

/** Cap para el mapa en memoria: purga oportunista de ventanas vencidas. */
const MAX_KEYS = 2000;

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

/**
 * Verificación de captcha lista para Turnstile.
 * Contrato explícito: si TURNSTILE_SECRET_KEY está configurado, el token es
 * obligatorio (fail-closed); si no hay secreto, el captcha se omite a
 * propósito — honeypot + time-trap + rate-limit son las capas activas.
 * Sin widget en el cliente no existe token que enviar: no configurar el
 * secreto hasta añadir el widget de Turnstile al formulario.
 */
export async function verifyCaptcha(token?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn("TURNSTILE_SECRET_KEY missing — contact captcha disabled by deploy choice");
    }
    return true;
  }
  if (!token) return false;
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
      }
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
