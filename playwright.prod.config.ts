import { defineConfig, devices } from "@playwright/test";

// Production e2e: exercises the built app (CSP/HSTS/ISR) via `next start`.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run start -- --port 3000",
    env: { ...process.env, GITHUB_API_BASE_URL: "http://127.0.0.1:9" },
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
