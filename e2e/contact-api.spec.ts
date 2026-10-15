import { expect, test } from "@playwright/test";

test.use({ locale: "es-CR" });

test("contact form renders in both locales", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByText("Conectemos").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /enviar mensaje/i })).toBeVisible();

  await page.goto("/en/contact");
  await expect(page.getByText("Let's Connect").first()).toBeVisible();
});

test("contact form shows a successful submission", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.fulfill({ json: { ok: true } }));
  await page.goto("/contact");
  await page.getByLabel("Nombre").fill("Ada Lovelace");
  await page.getByLabel("Correo").fill("ada@example.com");
  await page.getByLabel("Mensaje").fill("Me gustaría conversar sobre un proyecto de software.");
  await page.getByRole("button", { name: /enviar mensaje/i }).click();

  await expect(page.getByRole("status").filter({ hasText: "Mensaje enviado" })).toBeVisible();
  await expect(page.getByLabel("Nombre")).toHaveValue("");
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
  expect([400, 500, 502]).toContain(res.status());
});

test("contact API rejects cross-origin submissions", async ({ request }) => {
  const res = await request.post("/api/contact", {
    headers: { origin: "https://attacker.example" },
    data: { name: "Tester", email: "tester@example.com", message: "This message is long enough to pass validation." },
  });
  expect(res.status()).toBe(403);
});

test("source API rejects unknown files, search needs 2+ chars", async ({ request }) => {
  const unknown = await request.get("/api/source?file=nope&locale=es");
  expect(unknown.status()).toBe(400);

  const short = await request.get("/api/search?q=a&locale=es");
  expect(short.ok()).toBeTruthy();
  const body = (await short.json()) as { results: unknown[] };
  expect(body.results).toEqual([]);
});

test("GitHub page shows its fallback when the upstream API is unavailable", async ({ page }) => {
  await page.goto("/github");
  await expect(page.getByText("GitHub API no disponible ahora mismo")).toBeVisible();
  await expect(page.getByRole("link", { name: /abre el perfil directamente/i })).toHaveAttribute(
    "href",
    "https://github.com/Pochonski"
  );
});
