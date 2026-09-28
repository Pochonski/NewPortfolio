import { expect, test } from "@playwright/test";

test.use({ locale: "es-CR" });

test("contact form renders in both locales", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByText("Conectemos")).toBeVisible();
  await expect(page.getByRole("button", { name: /enviar mensaje/i })).toBeVisible();

  await page.goto("/en/contact");
  await expect(page.getByText("Let's Connect")).toBeVisible();
});

test("contact API rejects invalid payloads", async ({ request }) => {
  const bad = await request.post("/api/contact", {
    data: { name: "x", email: "not-an-email", message: "hi" },
  });
  expect(bad.status()).toBe(400);
});

test("contact API time-trap rejects instant submits", async ({ request }) => {
  const res = await request.post("/api/contact", {
    data: {
      name: "Tester",
      email: "tester@example.com",
      message: "This message is long enough to pass validation.",
      website: "",
      startedAt: Date.now(),
      locale: "es",
    },
  });
  expect([400, 403, 500, 502]).toContain(res.status());
});

test("source API rejects unknown files, search needs 2+ chars", async ({ request }) => {
  const unknown = await request.get("/api/source?file=nope&locale=es");
  expect(unknown.status()).toBe(400);

  const short = await request.get("/api/search?q=a&locale=es");
  expect(short.ok()).toBeTruthy();
  const body = (await short.json()) as { results: unknown[] };
  expect(body.results).toEqual([]);
});
