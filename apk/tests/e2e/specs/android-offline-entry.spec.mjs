import { expect, test } from "@playwright/test";

test("Android offline index should show start overlay", async ({ page }) => {
  await page.goto("/android-app/web/index.html");
  const overlay = page.locator("#screen-overlay");
  await expect(overlay).toHaveClass(/visible/);
});
