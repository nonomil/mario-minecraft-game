import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.MMWG_E2E_PORT || 4173);
const baseURL = `http://127.0.0.1:${port}`;
const channel = process.env.MMWG_E2E_CHANNEL ? String(process.env.MMWG_E2E_CHANNEL).trim() : "";
const useChannel = channel.length ? channel : undefined;

export default defineConfig({
  testDir: "./specs",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "test-results/playwright-report" }]],
  use: Object.assign({
    baseURL,
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  }, useChannel ? { channel: useChannel } : {}),
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ],
  webServer: {
    command: `node tools/serve-apk.mjs --port ${port}`,
    cwd: "../..",
    url: `${baseURL}/Game.html`,
    timeout: 120_000,
    reuseExistingServer: false
  }
});
