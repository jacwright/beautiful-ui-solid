import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests for the kit, run against the docs site's examples on a Vite dev server.
 * Each component gets a keyboard test from its APG pattern and an axe check.
 *
 * With DOCS_URL set, only the deploy check (pages.spec.ts) runs, against that deployed site.
 * The harness pages aren't deployed, and a new preview can take a moment to answer.
 */
const deployed = process.env.DOCS_URL;

export default defineConfig({
  testDir: "tests",
  testMatch: deployed ? "pages.spec.ts" : undefined,
  fullyParallel: true,
  // Every core: the default is half, and the browser suite is most of a test run.
  workers: "100%",
  forbidOnly: !!process.env.CI,
  retries: deployed ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: deployed ?? "http://localhost:5174" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: deployed
    ? undefined
    : {
        command: "vite --port 5174 --strictPort",
        url: "http://localhost:5174",
        reuseExistingServer: !process.env.CI,
      },
});
