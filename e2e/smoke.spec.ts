import { expect, test } from "@playwright/test";

// Spanish content is served prefix-less at "/" based on Accept-Language.
test.use({ locale: "es-CR" });

test("home loads with hero in both locales", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Joseph Fonseca").first()).toBeVisible();
  await expect(page.getByText("Disponible para trabajar")).toBeVisible();

  await page.goto("/en");
  await expect(page.getByText("Joseph Fonseca").first()).toBeVisible();
  await expect(page.getByText("Open to work")).toBeVisible();
});

test("theme switch persists across reload", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: /dracula/i }).click();
  await expect.poll(async () =>
    page.evaluate(() => window.localStorage.getItem("porto-ide-theme"))
  ).toBe("dracula");

  await page.reload();
  await expect(page.locator("html[data-theme='dracula']")).toHaveCount(1);
});

test("terminal help lists grouped commands", async ({ page }) => {
  await page.goto("/");
  await page.getByTitle(/Ctrl\+`/).click();
  const input = page.getByLabel(/entrada de terminal|terminal input/i);
  await expect(input).toBeVisible();
  await input.fill("help");
  await input.press("Enter");
  const log = page.getByRole("log");
  await expect(log.getByText("Comandos disponibles:")).toBeVisible();
  await expect(log.getByText("Navegación")).toBeVisible();
});

test("explorer navigation shows contact preview", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tree").getByText("contact.css").click();
  await expect(page).toHaveURL(/\/contact/);
  await expect(page.getByText("Conectemos")).toBeVisible();
});
