import { describe, expect, it } from "vitest";
import { getClientIp, rateLimit } from "./security";

describe("rateLimit", () => {
  it("allows up to the limit then blocks", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });

  it("resets after the window expires", () => {
    const key = `expiry-${Date.now()}-${Math.random()}`;
    expect(rateLimit(key, 1, 1)).toBe(true);
    expect(rateLimit(key, 1, 1)).toBe(false);
    const start = Date.now();
    while (Date.now() - start < 3) {
      // busy-wait past the 1ms window
    }
    expect(rateLimit(key, 1, 1)).toBe(true);
  });
});

describe("getClientIp", () => {
  const req = (headers: Record<string, string>) =>
    new Request("http://localhost/api/contact", { headers });

  it("prefers cf-connecting-ip over x-forwarded-for", () => {
    const r = req({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" });
    expect(getClientIp(r)).toBe("1.1.1.1");
  });

  it("falls back to unknown", () => {
    expect(getClientIp(req({}))).toBe("unknown");
  });
});
