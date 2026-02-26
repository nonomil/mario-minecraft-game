import { test, expect } from "@playwright/test";

test("task1: export/import save code", async ({ page }) => {
  await page.goto("/Game.html");
  const code = await page.evaluate(() => {
    localStorage.setItem("mmwg_accounts", JSON.stringify([{ id: "a1", username: "Alice" }]));
    return window.exportSaveCode();
  });
  expect(typeof code).toBe("string");
  expect(code.length).toBeGreaterThan(10);

  const username = await page.evaluate((payload) => {
    localStorage.clear();
    window.importSaveCode(payload);
    const list = JSON.parse(localStorage.getItem("mmwg_accounts") || "[]");
    return list[0]?.username || "";
  }, code);
  expect(username).toBe("Alice");
});
