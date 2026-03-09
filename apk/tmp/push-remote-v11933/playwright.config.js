// @ts-check
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  workers: 1,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: "node tools/serve-apk.mjs --port 4173",
    url: "http://127.0.0.1:4173/apk/Game.html",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
