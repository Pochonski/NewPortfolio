import { track } from "@vercel/analytics";

// Privacy-first custom events: counts only, never content.
// pageviews are automatic; these cover theme, terminal, files, contact.
export function trackEvent(name: string, props?: Record<string, string>): void {
  if (process.env.NODE_ENV !== "production") return;
  try {
    track(name, props);
  } catch {
    /* analytics blocked/unavailable */
  }
}
