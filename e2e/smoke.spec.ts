import { expect, test } from "@playwright/test";
import { THEME_KEY } from "../src/lib/storage-keys";

// Spanish content is served prefix-less at "/" based on Accept-Language.
test.use({ locale: "es-CR" });

test("home loads with hero in both locales", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Joseph Fonseca").first()).toBeVisible();
  await expect(page.getByText("Disponible para trabajar").first()).toBeVisible();

  await page.goto("/en");
  await expect(page.getByText("Joseph Fonseca").first()).toBeVisible();
  await expect(page.getByText("Open to work").first()).toBeVisible();
});

test("theme switch persists across reload", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: /dracula/i }).click();
  await expect.poll(async () =>
    page.evaluate((key) => window.localStorage.getItem(key), THEME_KEY)
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

test("explorer shows README.md and opens it as a code tab", async ({ page }) => {
  await page.goto("/");
  const tree = page.getByRole("tree");
  await expect(tree.getByText("README.md")).toBeVisible();
  await tree.getByText("README.md").click();
  // README opens as a code tab without navigating away from home.
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("tab", { name: "README.md" })).toBeVisible();
});

test("explorer navigation shows contact preview", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tree").getByText("contact.css").click();
  await expect(page).toHaveURL(/\/contact/);
  await expect(page.getByText("Conectemos")).toBeVisible();
});

test("opening a project from Contact switches to its virtual route", async ({ page }) => {
  await page.goto("/contact");
  const tree = page.getByRole("tree");
  await tree.getByText("perfumes-el-pocho.project").click();
  await expect(page).toHaveURL(/\/perfumes-el-pocho\.vercel\.app$/);
  await expect(page.getByRole("tab", { name: "contact.css" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "perfumes-el-pocho.vercel.app" })).toBeVisible();
  await expect(page.locator("#ide-editor iframe:visible")).toHaveAttribute("src", "https://perfumes-el-pocho.vercel.app/");

  await tree.getByText("prestamos-mi-principe.project").click();
  await expect(page).toHaveURL(/\/prestamos-mi-principe\.vercel\.app(?:\/login)?$/);
  await expect(page.getByRole("tab", { name: "perfumes-el-pocho.vercel.app" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "prestamos-mi-principe.vercel.app" })).toBeVisible();
});

test("direct project URL loads the embedded route and survives reload", async ({ page }) => {
  const virtualPath = "/perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer";
  await page.goto(virtualPath);
  await expect(page.getByRole("tab", { name: "perfumes-el-pocho.vercel.app" })).toBeVisible();
  await expect(page.locator("#ide-editor iframe:visible")).toHaveAttribute(
    "src", "https://perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer"
  );
  await expect(page.getByLabel("Dirección del sitio")).toHaveValue(
    "https://perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer"
  );
  await page.reload();
  await expect(page).toHaveURL(virtualPath);
  await expect(page.locator("#ide-editor iframe:visible")).toHaveAttribute(
    "src", "https://perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer"
  );
});

test("clicking inside Perfumes updates the portfolio URL", async ({ page }) => {
  await page.goto("/perfumes-el-pocho.vercel.app");
  await page.frameLocator("#ide-editor iframe:visible")
    .locator('a[href="/categoria/perfumes-de-mujer"]')
    .click();
  await expect(page).toHaveURL("/perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer");
  await expect(page.getByLabel("Dirección del sitio")).toHaveValue(
    "https://perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer"
  );
});

test("project navigation updates browser history and follows Back and Forward", async ({ page }) => {
  await page.goto("/perfumes-el-pocho.vercel.app");
  const address = page.getByLabel("Dirección del sitio");
  await address.fill("/categoria/perfumes-de-mujer");
  await address.press("Enter");
  await expect(page).toHaveURL("/perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer");
  await page.goBack();
  await expect(page).toHaveURL("/perfumes-el-pocho.vercel.app");
  await expect(address).toHaveValue("https://perfumes-el-pocho.vercel.app/");
  await page.goForward();
  await expect(page).toHaveURL("/perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer");
  await expect(address).toHaveValue("https://perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer");
});

test("English project URL keeps the locale", async ({ page }) => {
  await page.goto("/en/perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer");
  await expect(page).toHaveURL("/en/perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer");
  await expect(page.getByLabel("Site address")).toHaveValue(
    "https://perfumes-el-pocho.vercel.app/categoria/perfumes-de-mujer"
  );
});

test("unknown virtual project host returns 404", async ({ page }) => {
  const response = await page.goto("/unknown.vercel.app/route");
  expect(response?.status()).toBe(404);
});

test("integrated browser shows the redirected Prestamos login path", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("tree").getByText("prestamos-mi-principe.project").click();

  await expect(page.getByLabel("Dirección del sitio")).toHaveValue(
    "https://prestamos-mi-principe.vercel.app/login",
    { timeout: 15_000 }
  );
  await expect(page).toHaveURL("/prestamos-mi-principe.vercel.app/login");
});

test("integrated browser keeps the active ScoreHub route", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("tree").getByText("scorehub.project").click();
  await expect(page).toHaveURL("/scorehub-pocho.vercel.app");

  const address = page.getByLabel("Dirección del sitio");
  const scoreHubMatches = "https://scorehub-pocho.vercel.app/competicion/11/matches";
  await address.fill("/competicion/11/matches");
  await address.press("Enter");

  await expect(address).toHaveValue(scoreHubMatches);
  await expect(page).toHaveURL("/scorehub-pocho.vercel.app/competicion/11/matches");
  await expect(page.locator("#ide-editor iframe:visible")).toHaveAttribute("src", scoreHubMatches);
  await expect.poll(
    () => page.frames().some((frame) => frame.url() === scoreHubMatches),
    { timeout: 15_000 }
  ).toBe(true);
  await expect(address).toHaveValue(scoreHubMatches);
});

test("sidebar search finds and opens files", async ({ page }) => {
  await page.goto("/");
  await page.getByTitle("Buscar (Ctrl+Shift+F)").click();
  const input = page.getByRole("textbox", { name: "Buscar en archivos" });
  await expect(input).toBeVisible();
  await input.fill("skills");
  const results = page.getByRole("list", { name: "Resultados de búsqueda" });
  const fileButton = results.getByRole("button", { name: "skills.ts" });
  await expect(fileButton).toBeVisible();
  await fileButton.click();
  // Opening a result returns the sidebar to the files view.
  await expect(page.getByRole("tree")).toBeVisible();
});

test("navigating to a route exits live sites", async ({ page }) => {
  await page.goto("/");
  const tree = page.getByRole("tree");
  await tree.getByText("perfumes-el-pocho.project").click();
  await expect(page.getByRole("tab", { name: "perfumes-el-pocho.vercel.app" })).toBeVisible();
  await tree.getByText("contact.css").click();
  await expect(page).toHaveURL(/\/contact/);
  await expect(page.getByRole("tab", { name: "perfumes-el-pocho.vercel.app" })).toHaveCount(0);
  await expect(page.getByText("Conectemos")).toBeVisible();
});

test("restored live sites do not leak into another route", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("tree").getByText("perfumes-el-pocho.project").click();
  await expect(page.getByRole("tab", { name: "perfumes-el-pocho.vercel.app" })).toBeVisible();

  // A direct load creates a new IDE instance, which must not restore the
  // project iframe saved while the user was on /projects.
  await page.goto("/contact");
  await expect(page.getByRole("tab", { name: "perfumes-el-pocho.vercel.app" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "contact.css" })).toBeVisible();
});
