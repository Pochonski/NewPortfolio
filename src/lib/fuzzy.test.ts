import { describe, expect, it } from "vitest";
import { fuzzyScore } from "./fuzzy";

describe("fuzzyScore", () => {
  it("returns 0 for empty query", () => {
    expect(fuzzyScore("", "anything")).toBe(0);
  });

  it("returns null on no-match", () => {
    expect(fuzzyScore("zzz", "about.md")).toBeNull();
  });

  it("prefers prefix and boundary matches", () => {
    const prefix = fuzzyScore("ab", "about.md");
    const middle = fuzzyScore("ab", "xyzabc");
    expect(prefix).not.toBeNull();
    expect(middle).not.toBeNull();
    expect(prefix!).toBeGreaterThan(middle!);
  });

  it("scores consecutive runs higher", () => {
    const run = fuzzyScore("pro", "projects.js");
    const spread = fuzzyScore("poe", "projects.js");
    expect(run).not.toBeNull();
    expect(spread).not.toBeNull();
    expect(run!).toBeGreaterThan(spread!);
  });
});
