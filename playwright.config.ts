import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests for the Дневен оборот and Отпуски sections.
 *
 * Supabase is reached from the browser, so tests intercept its REST calls and
 * serve fixtures. That keeps runs deterministic and means no live credentials
 * (which this environment does not have) are required.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use the Chrome already installed on this machine rather than
        // downloading a Playwright build.
        channel: "chrome",
      },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100/bg/admin-login",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
