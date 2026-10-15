import { describe, expect, it } from "vitest";
import { siteFromVirtualPath, virtualPathForSiteUrl } from "./files";

describe("virtual project routes", () => {
  it("maps a deep project URL in both portfolio locales", () => {
    const href = "https://perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer?invite=secret#details";
    expect(virtualPathForSiteUrl(href)).toBe(
      "/perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer"
    );
    expect(virtualPathForSiteUrl(href, "en")).toBe(
      "/en/perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer"
    );
    expect(siteFromVirtualPath("/en/perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer")?.href).toBe(
      "https://perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer"
    );
  });

  it("only accepts configured external origins and virtual hosts", () => {
    expect(virtualPathForSiteUrl("https://perfumes-el-pocho.vercel.app.evil.test/login")).toBeNull();
    expect(siteFromVirtualPath("/unknown.vercel.app/login")).toBeNull();
    expect(siteFromVirtualPath("/scorehub-pocho.vercel.app/competicion/11/matches")?.href).toBe(
      "https://scorehub-pocho.vercel.app/competicion/11/matches"
    );
  });
});
